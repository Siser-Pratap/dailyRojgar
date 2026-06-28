import request from 'supertest'
import { createApp } from '../../app'
import * as paymentService from '../../services/payment.service'

jest.mock('../../services/payment.service', () => ({
  createPaymentOrder: jest.fn(),
  verifyPayment: jest.fn(),
  handlePaymentWebhook: jest.fn(),
  getPaymentByBooking: jest.fn(),
  refundPayment: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => {
  const { ApiError } = require('../../utils/ApiError')
  return {
    authenticate: (req: any, _res: any, next: any) => {
      req.user = {
        sub: req.headers['x-test-user'] ?? 'customer-1',
        role: req.headers['x-test-role'] ?? 'customer',
        iat: 1,
        exp: 9999999999,
      }
      next()
    },
    authorize:
      (...roles: string[]) =>
      (req: any, _res: any, next: any) => {
        if (!roles.includes(req.user.role))
          return next(ApiError.forbidden('Insufficient permissions'))
        next()
      },
  }
})

describe('payment routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('creates Razorpay order for customer', async () => {
    ;(paymentService.createPaymentOrder as jest.Mock).mockResolvedValue({
      orderId: 'order_1',
      amount: 110000,
      currency: 'INR',
    })

    const res = await request(app)
      .post('/api/payments/create-order')
      .send({ bookingId: 'booking-1' })

    expect(res.status).toBe(201)
    expect(paymentService.createPaymentOrder).toHaveBeenCalledWith('customer-1', 'booking-1')
  })

  it('verifies payment signature payload', async () => {
    ;(paymentService.verifyPayment as jest.Mock).mockResolvedValue({
      _id: 'payment-1',
      status: 'captured',
    })

    const res = await request(app).post('/api/payments/verify').send({
      orderId: 'order_1',
      paymentId: 'pay_1',
      signature: 'signature',
    })

    expect(res.status).toBe(200)
    expect(paymentService.verifyPayment).toHaveBeenCalledWith(
      'customer-1',
      expect.objectContaining({ orderId: 'order_1' }),
    )
  })

  it('passes webhook signature and body to service', async () => {
    ;(paymentService.handlePaymentWebhook as jest.Mock).mockResolvedValue({
      received: true,
      event: 'payment.captured',
    })

    const res = await request(app)
      .post('/api/payments/webhook')
      .set('x-razorpay-signature', 'webhook-signature')
      .send({ event: 'payment.captured' })

    expect(res.status).toBe(200)
    expect(paymentService.handlePaymentWebhook).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'payment.captured' }),
      'webhook-signature',
      expect.any(String),
    )
  })

  it('lets an admin refund a payment', async () => {
    ;(paymentService.refundPayment as jest.Mock).mockResolvedValue({ status: 'refund_initiated' })

    const res = await request(app)
      .post('/api/payments/pay-1/refund')
      .set('x-test-role', 'admin')
      .send({ reason: 'Admin refund' })

    expect(res.status).toBe(200)
    expect(paymentService.refundPayment).toHaveBeenCalledWith('pay-1', 'Admin refund')
  })

  it('blocks a customer from refunding a payment', async () => {
    const res = await request(app).post('/api/payments/pay-1/refund').send({ reason: 'x' })

    expect(res.status).toBe(403)
    expect(paymentService.refundPayment).not.toHaveBeenCalled()
  })
})
