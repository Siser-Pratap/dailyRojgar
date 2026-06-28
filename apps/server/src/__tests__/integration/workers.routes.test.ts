import request from 'supertest'
import { createApp } from '../../app'
import * as workerService from '../../services/worker.service'
import { ApiError } from '../../utils/ApiError'

jest.mock('../../services/worker.service', () => ({
  listWorkers: jest.fn(),
  getWorkerPublicProfile: jest.fn(),
  upsertWorkerProfile: jest.fn(),
  updateAvailability: jest.fn(),
  addWorkerDocument: jest.fn(),
  getWorkerStats: jest.fn(),
  getWorkerJobs: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => {
  const { ApiError } = require('../../utils/ApiError')
  return {
    authenticate: (req: any, _res: any, next: any) => {
      req.user = {
        sub: req.headers['x-test-user'] ?? 'worker-1',
        role: req.headers['x-test-role'] ?? 'worker',
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

describe('worker routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('returns a public worker profile via /api/workers/:id', async () => {
    ;(workerService.getWorkerPublicProfile as jest.Mock).mockResolvedValue({
      _id: 'p1',
      userId: { _id: 'u1', name: 'Ramesh' },
      categoryId: 'Electrical',
      pricePerDay: 800,
    })

    const res = await request(app).get('/api/workers/u1')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.userId.name).toBe('Ramesh')
    expect(workerService.getWorkerPublicProfile).toHaveBeenCalledWith('u1')
  })

  it('returns 404 when the worker does not exist', async () => {
    ;(workerService.getWorkerPublicProfile as jest.Mock).mockRejectedValue(
      ApiError.notFound('Worker profile'),
    )

    const res = await request(app).get('/api/workers/missing')

    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('returns the current worker stats', async () => {
    ;(workerService.getWorkerStats as jest.Mock).mockResolvedValue({
      totalJobs: 5,
      completedJobs: 4,
      activeJobs: 1,
      totalEarnings: 4000,
      rating: { average: 4.5, totalReviews: 3 },
      isAvailable: true,
    })

    const res = await request(app).get('/api/workers/me/stats')

    expect(res.status).toBe(200)
    expect(res.body.data.completedJobs).toBe(4)
    expect(workerService.getWorkerStats).toHaveBeenCalledWith('worker-1')
  })

  it('upserts the worker profile', async () => {
    ;(workerService.upsertWorkerProfile as jest.Mock).mockResolvedValue({ _id: 'p1' })

    const res = await request(app)
      .post('/api/workers/profile')
      .send({ categoryId: 'Electrical', skills: ['Wiring'], pricePerDay: 800 })

    expect(res.status).toBe(200)
    expect(workerService.upsertWorkerProfile).toHaveBeenCalledWith(
      'worker-1',
      expect.objectContaining({ categoryId: 'Electrical', pricePerDay: 800 }),
    )
  })

  it('updates availability', async () => {
    ;(workerService.updateAvailability as jest.Mock).mockResolvedValue({ isAvailable: false })

    const res = await request(app).patch('/api/workers/availability').send({ isAvailable: false })

    expect(res.status).toBe(200)
    expect(workerService.updateAvailability).toHaveBeenCalledWith('worker-1', false)
  })

  it('blocks a customer from worker self-service routes', async () => {
    const res = await request(app).get('/api/workers/me/stats').set('x-test-role', 'customer')

    expect(res.status).toBe(403)
    expect(workerService.getWorkerStats).not.toHaveBeenCalled()
  })

  it('validates the document upload payload', async () => {
    const res = await request(app).post('/api/workers/documents').send({ type: 'invalid' })

    expect(res.status).toBe(422)
    expect(workerService.addWorkerDocument).not.toHaveBeenCalled()
  })
})
