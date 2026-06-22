type RouteMetric = {
  count: number
  statusCounts: Record<string, number>
  durationsMs: number[]
}

type QueryMetric = {
  count: number
  durationsMs: number[]
}

type QueueMetric = {
  completed: number
  failed: number
  durationsMs: number[]
  payoutLatenciesMs: number[]
}

const routeMetrics = new Map<string, RouteMetric>()
const mongoMetrics = new Map<string, QueryMetric>()
const queueMetrics = new Map<string, QueueMetric>()

let redisHits = 0
let redisMisses = 0

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)
  return Number(sorted[index].toFixed(2))
}

function boundedPush(values: number[], value: number, max = 1000) {
  values.push(value)
  if (values.length > max) values.shift()
}

export function recordHttpRequest(input: {
  method: string
  route: string
  statusCode: number
  durationMs: number
}) {
  const key = `${input.method.toUpperCase()} ${input.route}`
  const metric = routeMetrics.get(key) ?? { count: 0, statusCounts: {}, durationsMs: [] }
  metric.count += 1
  const statusGroup = `${Math.floor(input.statusCode / 100)}xx`
  metric.statusCounts[statusGroup] = (metric.statusCounts[statusGroup] ?? 0) + 1
  boundedPush(metric.durationsMs, input.durationMs)
  routeMetrics.set(key, metric)
}

export function recordMongoQuery(model: string, operation: string, durationMs: number) {
  const key = `${model}.${operation}`
  const metric = mongoMetrics.get(key) ?? { count: 0, durationsMs: [] }
  metric.count += 1
  boundedPush(metric.durationsMs, durationMs)
  mongoMetrics.set(key, metric)
}

export function recordRedisGet(hit: boolean) {
  if (hit) redisHits += 1
  else redisMisses += 1
}

export function recordQueueJob(input: {
  queueName: string
  status: 'completed' | 'failed'
  durationMs?: number
}) {
  const metric = queueMetrics.get(input.queueName) ?? {
    completed: 0,
    failed: 0,
    durationsMs: [],
    payoutLatenciesMs: [],
  }
  metric[input.status] += 1
  if (input.durationMs !== undefined) boundedPush(metric.durationsMs, input.durationMs)
  queueMetrics.set(input.queueName, metric)
}

export function recordPayoutLatency(queueName: string, latencyMs: number) {
  const metric = queueMetrics.get(queueName) ?? {
    completed: 0,
    failed: 0,
    durationsMs: [],
    payoutLatenciesMs: [],
  }
  boundedPush(metric.payoutLatenciesMs, latencyMs)
  queueMetrics.set(queueName, metric)
}

function summarizeDurations(values: number[]) {
  return {
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
    samples: values.length,
  }
}

export function getMetricsSnapshot() {
  const routes = Object.fromEntries(
    [...routeMetrics.entries()].map(([key, metric]) => [
      key,
      {
        count: metric.count,
        statusCounts: metric.statusCounts,
        responseTimeMs: summarizeDurations(metric.durationsMs),
      },
    ]),
  )

  const mongo = Object.fromEntries(
    [...mongoMetrics.entries()].map(([key, metric]) => [
      key,
      {
        count: metric.count,
        queryTimeMs: summarizeDurations(metric.durationsMs),
      },
    ]),
  )

  const queues = Object.fromEntries(
    [...queueMetrics.entries()].map(([key, metric]) => [
      key,
      {
        completed: metric.completed,
        failed: metric.failed,
        processingTimeMs: summarizeDurations(metric.durationsMs),
        payoutLatencyMs: summarizeDurations(metric.payoutLatenciesMs),
      },
    ]),
  )

  const redisTotal = redisHits + redisMisses

  return {
    routes,
    mongo,
    redis: {
      hits: redisHits,
      misses: redisMisses,
      hitRate: redisTotal === 0 ? 0 : Number((redisHits / redisTotal).toFixed(4)),
    },
    queues,
  }
}
