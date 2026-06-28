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
})
