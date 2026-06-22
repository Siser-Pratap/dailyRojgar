import {
  getMetricsSnapshot,
  recordHttpRequest,
  recordMongoQuery,
  recordPayoutLatency,
  recordQueueJob,
  recordRedisGet,
} from '../../services/metrics.service'

describe('metrics service', () => {
  it('records HTTP, Mongo, Redis, and queue metrics', () => {
    recordHttpRequest({ method: 'GET', route: '/api/workers', statusCode: 200, durationMs: 20 })
    recordHttpRequest({ method: 'GET', route: '/api/workers', statusCode: 500, durationMs: 100 })
    recordMongoQuery('User', 'find', 12)
    recordRedisGet(true)
    recordRedisGet(false)
    recordQueueJob({ queueName: 'email-queue', status: 'completed', durationMs: 40 })
    recordQueueJob({ queueName: 'email-queue', status: 'failed', durationMs: 80 })
    recordPayoutLatency('payout-queue', 250)

    const snapshot = getMetricsSnapshot()

    expect(snapshot.routes['GET /api/workers'].count).toBeGreaterThanOrEqual(2)
    expect(snapshot.routes['GET /api/workers'].statusCounts['2xx']).toBeGreaterThanOrEqual(1)
    expect(snapshot.mongo['User.find'].count).toBeGreaterThanOrEqual(1)
    expect(snapshot.redis.hitRate).toBeGreaterThanOrEqual(0)
    expect(snapshot.queues['email-queue'].completed).toBeGreaterThanOrEqual(1)
    expect(snapshot.queues['payout-queue'].payoutLatencyMs.samples).toBeGreaterThanOrEqual(1)
  })
})
