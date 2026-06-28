import request from 'supertest'
import { createApp } from '../../app'
import * as reviewService from '../../services/review.service'

jest.mock('../../services/review.service', () => ({
  createReview: jest.fn(),
  listWorkerReviews: jest.fn(),
  getReviewByBooking: jest.fn(),
  replyToReview: jest.fn(),
  deleteReview: jest.fn(),
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

describe('review routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('creates a review for a customer', async () => {
    ;(reviewService.createReview as jest.Mock).mockResolvedValue({ _id: 'r1', rating: 5 })

    const res = await request(app)
      .post('/api/reviews')
      .send({ bookingId: 'b1', rating: 5, comment: 'Great' })

    expect(res.status).toBe(201)
    expect(reviewService.createReview).toHaveBeenCalledWith(
      'customer-1',
      expect.objectContaining({ bookingId: 'b1', rating: 5 }),
    )
  })

  it('blocks a worker from creating a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('x-test-role', 'worker')
      .send({ bookingId: 'b1', rating: 5 })

    expect(res.status).toBe(403)
    expect(reviewService.createReview).not.toHaveBeenCalled()
  })

  it('validates rating bounds', async () => {
    const res = await request(app).post('/api/reviews').send({ bookingId: 'b1', rating: 9 })

    expect(res.status).toBe(422)
    expect(reviewService.createReview).not.toHaveBeenCalled()
  })

  it('returns the review for a booking', async () => {
    ;(reviewService.getReviewByBooking as jest.Mock).mockResolvedValue({ _id: 'r1', rating: 4 })

    const res = await request(app).get('/api/reviews/booking/b1')

    expect(res.status).toBe(200)
    expect(res.body.data.rating).toBe(4)
    expect(reviewService.getReviewByBooking).toHaveBeenCalledWith('b1', 'customer-1')
  })

  it('returns null when a booking has no review', async () => {
    ;(reviewService.getReviewByBooking as jest.Mock).mockResolvedValue(null)

    const res = await request(app).get('/api/reviews/booking/b1')

    expect(res.status).toBe(200)
    expect(res.body.data).toBeNull()
  })

  it('lists worker reviews publicly', async () => {
    ;(reviewService.listWorkerReviews as jest.Mock).mockResolvedValue([{ _id: 'r1' }])

    const res = await request(app).get('/api/reviews/worker/worker-1')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
})
