import request from 'supertest'
import { createApp } from '../../app'
import * as bookingService from '../../services/booking.service'

jest.mock('../../services/booking.service', () => ({
  createBooking: jest.fn(),
  listMyBookings: jest.fn(),
  getBookingDetail: jest.fn(),
  acceptBooking: jest.fn(),
  rejectBooking: jest.fn(),
  startBooking: jest.fn(),
  completeBooking: jest.fn(),
  cancelBooking: jest.fn(),
  disputeBooking: jest.fn(),
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

describe('booking routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('creates a booking for customer role', async () => {
    ;(bookingService.createBooking as jest.Mock).mockResolvedValue({
      _id: 'booking-1',
      status: 'pending',
    })

    const res = await request(app).post('/api/bookings').send({
      workerId: 'worker-1',
      categoryId: 'Electrical',
      scheduledDate: '2026-06-23T10:00:00.000Z',
      amount: 1000,
    })

    expect(res.status).toBe(201)
    expect(bookingService.createBooking).toHaveBeenCalledWith(
      'customer-1',
      expect.objectContaining({ workerId: 'worker-1' }),
    )
  })

  it('blocks create booking for worker role', async () => {
    const res = await request(app).post('/api/bookings').set('x-test-role', 'worker').send({
      workerId: 'worker-1',
      categoryId: 'Electrical',
      scheduledDate: '2026-06-23T10:00:00.000Z',
      amount: 1000,
    })

    expect(res.status).toBe(403)
    expect(bookingService.createBooking).not.toHaveBeenCalled()
  })

  it('validates booking payload before service call', async () => {
    const res = await request(app).post('/api/bookings').send({ categoryId: 'Electrical' })

    expect(res.status).toBe(422)
    expect(bookingService.createBooking).not.toHaveBeenCalled()
  })

  it('lists current user bookings', async () => {
    ;(bookingService.listMyBookings as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      skip: 0,
    })

    const res = await request(app).get('/api/bookings')

    expect(res.status).toBe(200)
    expect(res.body.meta.total).toBe(0)
  })
})
