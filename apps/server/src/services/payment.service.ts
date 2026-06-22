import crypto from 'crypto'
import { BookingModel, BookingStatus } from '../models/Booking.model'
import { PaymentModel, PaymentStatus } from '../models/Payment.model'
import { env } from '../config/env'
import { PLATFORM_FEE_PERCENT } from '../config/constants'
import { ApiError } from '../utils/ApiError'
import { createNotification, dispatchNotificationEvent } from './notification.service'
import { emitBookingUpdate } from '../sockets/socket.service'
import { createRazorpayOrder, createRazorpayRefund } from './razorpay.service'
import { queueWorkerPayoutJob } from '../queues/payout.queue'

interface RazorpayWebhookPayload {
  event?: string
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity }
    refund?: { entity?: RazorpayRefundEntity }
  }
}

interface RazorpayPaymentEntity {
  id?: string
  order_id?: string
  amount?: number
  status?: string
  error_description?: string
}

interface RazorpayRefundEntity {
  id?: string
  payment_id?: string
  amount?: number
  status?: string
}

function assertBookingAccess(
  booking: { customerId: unknown; workerId: unknown },
  userId: string,
  role: string,
) {
  if (role === 'admin') return
  if (String(booking.customerId) !== userId && String(booking.workerId) !== userId) {
    throw ApiError.forbidden('You do not have access to this payment')
  }
}

function signHmac(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function safeCompare(signature: string, expected: string) {
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  return (
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  )
}

function verifyCheckoutSignature(input: { orderId: string; paymentId: string; signature: string }) {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw ApiError.internal('Razorpay key secret is not configured', 'PAYMENT_CONFIG')
  }

  const expected = signHmac(`${input.orderId}|${input.paymentId}`, env.RAZORPAY_KEY_SECRET)
  if (!safeCompare(input.signature, expected)) {
    throw ApiError.badRequest('Invalid payment signature', 'PAYMENT_SIGNATURE_INVALID')
  }
}

function verifyWebhookSignature(rawBody: string, signature?: string) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw ApiError.internal('Razorpay webhook secret is not configured', 'PAYMENT_CONFIG')
  }
  if (!signature) {
    throw ApiError.unauthorized('Missing Razorpay webhook signature', 'PAYMENT_WEBHOOK_SIGNATURE')
  }

  const expected = signHmac(rawBody, env.RAZORPAY_WEBHOOK_SECRET)
  if (!safeCompare(signature, expected)) {
    throw ApiError.unauthorized('Invalid Razorpay webhook signature', 'PAYMENT_WEBHOOK_SIGNATURE')
  }
}

function calculateWorkerPayout(baseAmount: number, platformFee: number) {
  return Math.max(0, baseAmount - platformFee)
}

function calculateRefundAmount(
  status: BookingStatus,
  paymentAmount: number,
  acceptedBefore = false,
) {
  if (['in_progress', 'completed', 'disputed'].includes(status)) {
    throw ApiError.badRequest('Refund is not allowed after work has started; use dispute process')
  }

  if (status === 'accepted' || acceptedBefore) {
    return Math.round(paymentAmount * 0.9)
  }

  return paymentAmount
}

async function updateBookingPaymentState(input: {
  bookingId: unknown
  paymentId: unknown
  status: 'created' | 'paid' | 'failed' | 'refund_initiated' | 'refunded'
}) {
  const booking = await BookingModel.findByIdAndUpdate(
    input.bookingId,
    {
      $set: {
        paymentStatus: input.status,
        paymentId: input.paymentId,
      },
    },
    { new: true },
  ).lean()

  if (booking) {
    emitBookingUpdate({
      bookingId: booking._id.toString(),
      customerId: booking.customerId.toString(),
      workerId: booking.workerId.toString(),
      status: booking.status,
      booking,
    })
  }

  return booking
}

async function markPaymentCaptured(input: {
  providerOrderId: string
  providerPaymentId?: string
  providerSignature?: string
  rawEvent?: RazorpayWebhookPayload
}) {
  const payment = await PaymentModel.findOneAndUpdate(
    { providerOrderId: input.providerOrderId },
    {
      $set: {
        status: 'captured' satisfies PaymentStatus,
        providerPaymentId: input.providerPaymentId,
        providerSignature: input.providerSignature,
        capturedAt: new Date(),
      },
      ...(input.rawEvent ? { $push: { rawWebhookEvents: input.rawEvent } } : {}),
    },
    { new: true },
  )
  if (!payment) throw ApiError.notFound('Payment')

  await updateBookingPaymentState({
    bookingId: payment.bookingId,
    paymentId: payment._id,
    status: 'paid',
  })

  await Promise.all([
    dispatchNotificationEvent('payment.received', {
      userId: payment.workerId,
      title: 'Payment captured',
      message: `Payment received for booking ${payment.bookingId.toString()}`,
      type: 'payment',
      data: { bookingId: payment.bookingId.toString(), paymentId: payment._id.toString() },
    }),
    createNotification({
      userId: payment.customerId,
      title: 'Payment successful',
      message: 'Your payment has been verified successfully',
      type: 'payment',
      data: { bookingId: payment.bookingId.toString(), paymentId: payment._id.toString() },
    }),
    queueWorkerPayoutJob({
      paymentId: payment._id.toString(),
      bookingId: payment.bookingId.toString(),
      workerId: payment.workerId.toString(),
      amount: payment.workerPayout,
      currency: payment.currency,
    }),
  ])

  return payment.toObject()
}

async function markPaymentFailed(
  providerOrderId: string,
  reason?: string,
  rawEvent?: RazorpayWebhookPayload,
) {
  const payment = await PaymentModel.findOneAndUpdate(
    { providerOrderId },
    {
      $set: { status: 'failed' satisfies PaymentStatus },
      ...(rawEvent ? { $push: { rawWebhookEvents: rawEvent } } : {}),
    },
    { new: true },
  )
  if (!payment) throw ApiError.notFound('Payment')

  await updateBookingPaymentState({
    bookingId: payment.bookingId,
    paymentId: payment._id,
    status: 'failed',
  })

  await createNotification({
    userId: payment.customerId,
    title: 'Payment failed',
    message: reason ?? 'Your payment could not be completed. Please retry.',
    type: 'payment',
    data: { bookingId: payment.bookingId.toString(), paymentId: payment._id.toString() },
  })

  return payment.toObject()
}

export async function createPaymentOrder(customerId: string, bookingId: string) {
  const booking = await BookingModel.findById(bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')
  if (String(booking.customerId) !== customerId) throw ApiError.forbidden('Only customer can pay')
  if (booking.paymentStatus === 'paid') throw ApiError.conflict('Booking is already paid')

  const order = await createRazorpayOrder({
    amountInRupees: booking.totalAmount,
    currency: 'INR',
    receipt: booking.bookingNumber,
    notes: {
      bookingId: booking._id.toString(),
      customerId,
      workerId: booking.workerId.toString(),
    },
  })

  const platformFee =
    booking.platformFee || Math.round((booking.amount * PLATFORM_FEE_PERCENT) / 100)
  const payment = await PaymentModel.findOneAndUpdate(
    { bookingId },
    {
      $set: {
        providerOrderId: order.id,
        amount: booking.totalAmount,
        baseAmount: booking.amount,
        platformFee,
        workerPayout: calculateWorkerPayout(booking.amount, platformFee),
        currency: order.currency,
        status: 'created' satisfies PaymentStatus,
      },
      $setOnInsert: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        provider: 'razorpay',
      },
    },
    { new: true, upsert: true, runValidators: true },
  )

  await updateBookingPaymentState({
    bookingId,
    paymentId: payment._id,
    status: 'created',
  })

  return {
    orderId: order.id,
    amount: order.amount,
    amountRupees: booking.totalAmount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,
    payment: payment.toObject(),
  }
}

export async function verifyPayment(
  customerId: string,
  input: { orderId: string; paymentId: string; signature: string },
) {
  const payment = await PaymentModel.findOne({ providerOrderId: input.orderId })
  if (!payment) throw ApiError.notFound('Payment')
  if (String(payment.customerId) !== customerId)
    throw ApiError.forbidden('Only customer can verify payment')

  verifyCheckoutSignature(input)
  return markPaymentCaptured({
    providerOrderId: input.orderId,
    providerPaymentId: input.paymentId,
    providerSignature: input.signature,
  })
}

export async function handlePaymentWebhook(
  payload: RazorpayWebhookPayload,
  signature?: string,
  rawBody?: string,
) {
  if (!rawBody) throw ApiError.badRequest('Raw webhook body is required', 'PAYMENT_WEBHOOK_BODY')
  verifyWebhookSignature(rawBody, signature)

  const event = String(payload.event ?? 'unknown')
  const paymentEntity = payload.payload?.payment?.entity
  const refundEntity = payload.payload?.refund?.entity

  let payment = null

  if (event === 'payment.captured' && paymentEntity?.order_id) {
    payment = await markPaymentCaptured({
      providerOrderId: paymentEntity.order_id,
      providerPaymentId: paymentEntity.id,
      rawEvent: payload,
    })
  } else if (event === 'payment.failed' && paymentEntity?.order_id) {
    payment = await markPaymentFailed(
      paymentEntity.order_id,
      paymentEntity.error_description,
      payload,
    )
  } else if (event === 'refund.created' && refundEntity?.payment_id) {
    payment = await PaymentModel.findOneAndUpdate(
      { providerPaymentId: refundEntity.payment_id },
      {
        $set: {
          status: 'refund_initiated' satisfies PaymentStatus,
          refundId: refundEntity.id,
          refundAmount: refundEntity.amount ? refundEntity.amount / 100 : undefined,
        },
        $push: { rawWebhookEvents: payload },
      },
      { new: true },
    ).lean()
    if (payment) {
      await updateBookingPaymentState({
        bookingId: payment.bookingId,
        paymentId: payment._id,
        status: 'refund_initiated',
      })
    }
  } else if (event === 'refund.processed' && refundEntity?.payment_id) {
    payment = await PaymentModel.findOneAndUpdate(
      { providerPaymentId: refundEntity.payment_id },
      {
        $set: {
          status: 'refunded' satisfies PaymentStatus,
          refundId: refundEntity.id,
          refundAmount: refundEntity.amount ? refundEntity.amount / 100 : undefined,
          refundedAt: new Date(),
        },
        $push: { rawWebhookEvents: payload },
      },
      { new: true },
    ).lean()
    if (payment) {
      await updateBookingPaymentState({
        bookingId: payment.bookingId,
        paymentId: payment._id,
        status: 'refunded',
      })
      await createNotification({
        userId: payment.customerId,
        title: 'Refund processed',
        message: 'Your refund has been processed successfully',
        type: 'payment',
        data: { paymentId: payment._id.toString(), refundId: payment.refundId },
      })
    }
  }

  if (paymentEntity?.order_id && event !== 'payment.captured' && event !== 'payment.failed') {
    await PaymentModel.findOneAndUpdate(
      { providerOrderId: paymentEntity.order_id },
      { $push: { rawWebhookEvents: payload } },
    )
  }

  return { received: true, event, payment }
}

export async function getPaymentByBooking(userId: string, role: string, bookingId: string) {
  const payment = await PaymentModel.findOne({ bookingId }).lean()
  if (!payment) throw ApiError.notFound('Payment')
  assertBookingAccess(payment, userId, role)
  return payment
}

export async function refundPayment(paymentId: string, reason?: string) {
  const payment = await PaymentModel.findById(paymentId)
  if (!payment) throw ApiError.notFound('Payment')
  if (payment.status !== 'captured')
    throw ApiError.badRequest('Only captured payments can be refunded')
  if (!payment.providerPaymentId) throw ApiError.badRequest('Razorpay payment id is missing')

  const booking = await BookingModel.findById(payment.bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')

  const acceptedBefore = booking.statusHistory.some((item) => item.status === 'accepted')
  const refundAmount = calculateRefundAmount(booking.status, payment.amount, acceptedBefore)
  const refund = await createRazorpayRefund({
    paymentId: payment.providerPaymentId,
    amountInRupees: refundAmount,
    notes: {
      bookingId: booking._id.toString(),
      paymentId: payment._id.toString(),
      reason: reason ?? 'admin_refund',
    },
  })

  payment.status = 'refund_initiated'
  payment.refundId = refund.id
  payment.refundAmount = refundAmount
  payment.refundReason = reason
  payment.rawWebhookEvents.push({
    type: 'manual_refund',
    reason,
    refund,
    at: new Date().toISOString(),
  })
  await payment.save()

  await updateBookingPaymentState({
    bookingId: payment.bookingId,
    paymentId: payment._id,
    status: 'refund_initiated',
  })

  await createNotification({
    userId: payment.customerId,
    title: 'Refund initiated',
    message: `A refund of ₹${refundAmount} has been initiated for your booking`,
    type: 'payment',
    data: { paymentId: payment._id.toString(), refundId: payment.refundId, refundAmount },
  })

  return payment.toObject()
}
