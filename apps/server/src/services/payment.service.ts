import crypto from 'crypto'
import { BookingModel } from '../models/Booking.model'
import { PaymentModel } from '../models/Payment.model'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'
import { createNotification } from './notification.service'

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

export async function createPaymentOrder(customerId: string, bookingId: string) {
  const booking = await BookingModel.findById(bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')
  if (String(booking.customerId) !== customerId) throw ApiError.forbidden('Only customer can pay')

  const providerOrderId = `order_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
  const payment = await PaymentModel.findOneAndUpdate(
    { bookingId },
    {
      $setOnInsert: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        amount: booking.totalAmount,
        currency: 'INR',
        status: 'created',
        provider: 'razorpay',
        providerOrderId,
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean()

  return {
    orderId: payment.providerOrderId,
    amount: payment.amount,
    currency: payment.currency,
    keyId: env.RAZORPAY_KEY_ID ?? null,
    payment,
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

  if (env.RAZORPAY_KEY_SECRET) {
    const expected = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest('hex')
    if (expected !== input.signature) throw ApiError.badRequest('Invalid payment signature')
  }

  payment.status = 'captured'
  payment.providerPaymentId = input.paymentId
  payment.providerSignature = input.signature
  await payment.save()

  await createNotification({
    userId: payment.workerId,
    title: 'Payment captured',
    message: `Payment received for booking ${payment.bookingId.toString()}`,
    type: 'payment',
    data: { bookingId: payment.bookingId.toString(), paymentId: payment._id.toString() },
  })

  return payment.toObject()
}

export async function handlePaymentWebhook(payload: Record<string, unknown>) {
  const event = String(payload.event ?? 'unknown')
  const paymentEntity = (
    payload.payload as { payment?: { entity?: { order_id?: string; id?: string } } } | undefined
  )?.payment?.entity
  const orderId = paymentEntity?.order_id
  if (!orderId) return { received: true, event }

  const payment = await PaymentModel.findOneAndUpdate(
    { providerOrderId: orderId },
    {
      $push: { rawWebhookEvents: payload },
      ...(event.includes('failed') ? { $set: { status: 'failed' } } : {}),
    },
    { new: true },
  ).lean()

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

  payment.status = 'refunded'
  payment.refundId = `refund_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`
  payment.rawWebhookEvents.push({ type: 'manual_refund', reason, at: new Date().toISOString() })
  await payment.save()

  await createNotification({
    userId: payment.customerId,
    title: 'Payment refunded',
    message: 'Your payment refund has been initiated',
    type: 'payment',
    data: { paymentId: payment._id.toString(), refundId: payment.refundId },
  })

  return payment.toObject()
}
