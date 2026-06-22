import request from 'supertest'
import { createApp } from '../../app'
import { getQueueHealth } from '../../queues'

jest.mock('../../queues', () => ({
  getQueueHealth: jest.fn(),
}))

jest.mock('../../config/redis', () => ({
  getRedisClient: jest.fn(() => ({ ping: jest.fn().mockResolvedValue('PONG') })),
}))

describe('observability endpoints and headers', () => {
  const app = createApp()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getQueueHealth as jest.Mock).mockResolvedValue({
      email: { status: 'active', waiting: 0, active: 0, delayed: 0, failed: 0 },
      sms: { status: 'active', waiting: 0, active: 0, delayed: 0, failed: 0 },
    })
  })

  it('adds request and response-time headers', async () => {
    const res = await request(app).get('/api/metrics').set('x-request-id', 'test-request-id')

    expect(res.status).toBe(200)
    expect(res.headers['x-request-id']).toBe('test-request-id')
    expect(res.headers['x-response-time']).toMatch(/ms$/)
  })

  it('returns health with queues', async () => {
    const res = await request(app).get('/api/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.queues.email.status).toBe('active')
  })

  it('returns metrics snapshot', async () => {
    const res = await request(app).get('/api/metrics')

    expect(res.status).toBe(200)
    expect(res.body.metrics).toHaveProperty('routes')
    expect(res.body.metrics).toHaveProperty('redis')
    expect(res.body.metrics).toHaveProperty('queues')
  })
})
