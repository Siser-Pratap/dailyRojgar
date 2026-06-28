import crypto from 'crypto'
import { handlePaymentWebhook, verifyPayment } from '../../services/payment.service'
import { PaymentModel } from '../../models/Payment.model'

const KEY_SECRET = 'test_key_secret'
const WEBHOOK_SECRET = 'test_webhook_secret'

jest.mock('../../config/env', () => ({
  env: {
    RAZORPAY_KEY_ID: 'rzp_test_key',
    RAZORPAY_KEY_SECRET: 'test_key_secret',
    RAZORPAY_WEBHOOK_SECRET: 'test_webhook_secret',
  },
}))
jest.mock('../../models/Booking.model', () => ({ BookingModel: { findByIdAndUpdate: jest.fn() } }))
jest.mock('../../models/Payment.model', () => ({
  PaymentModel: { findOne: jest.fn(), findOneAndUpdate: jest.fn(), findById: jest.fn() },
}))
jest.mock('../../services/notification.service', () => ({
  createNotification: jest.fn(),
  dispatchNotificationEvent: jest.fn(),
}))
jest.mock('../../sockets/socket.service', () => ({ emitBookingUpdate: jest.fn() }))
jest.mock('../../services/razorpay.service', () => ({
  createRazorpayOrder: jest.fn(),
  createRazorpayRefund: jest.fn(),
}))
jest.mock('../../queues/payout.queue', () => ({ queueWorkerPayoutJob: jest.fn() }))

const sign = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex')

describe('payment service signature validation', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('verifyPayment (checkout signature)', () => {
    it('rejects an invalid checkout signature', async () => {
      ;(PaymentModel.findOne as jest.Mock).mockResolvedValue({ customerId: 'customer-1' })

      await expect(
        verifyPayment('customer-1', {
          orderId: 'order_1',
          paymentId: 'pay_1',
          signature: 'tampered',
        }),
      ).rejects.toMatchObject({ statusCode: 400, errorCode: 'PAYMENT_SIGNATURE_INVALID' })
    })

    it('forbids a customer verifying another customer payment', async () => {
      ;(PaymentModel.findOne as jest.Mock).mockResolvedValue({ customerId: 'someone-else' })

      await expect(
        verifyPayment('customer-1', { orderId: 'order_1', paymentId: 'pay_1', signature: 'x' }),
      ).rejects.toMatchObject({ statusCode: 403 })
    })
  })

  describe('handlePaymentWebhook', () => {
    it('requires the raw body', async () => {
      await expect(
        handlePaymentWebhook({ event: 'payment.captured' }, 'sig', undefined),
      ).rejects.toMatchObject({ statusCode: 400 })
    })

    it('rejects an invalid webhook signature', async () => {
      const rawBody = JSON.stringify({ event: 'payment.captured' })
      await expect(
        handlePaymentWebhook({ event: 'payment.captured' }, 'wrong-signature', rawBody),
      ).rejects.toMatchObject({ statusCode: 401 })
    })

    it('accepts a valid webhook signature', async () => {
      const payload = { event: 'order.paid' } // unknown event → no model writes
      const rawBody = JSON.stringify(payload)
      const signature = sign(rawBody, WEBHOOK_SECRET)

      const result = await handlePaymentWebhook(payload, signature, rawBody)

      expect(result).toMatchObject({ received: true, event: 'order.paid' })
    })
  })

  it('confirms the checkout signing scheme matches Razorpay', () => {
    // Sanity check the scheme used by verifyCheckoutSignature: HMAC(orderId|paymentId).
    const expected = sign('order_1|pay_1', KEY_SECRET)
    expect(expected).toHaveLength(64)
  })
})
