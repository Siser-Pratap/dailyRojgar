import { Queue } from 'bullmq'
import { env } from '../config/env'
import { logger } from '../utils/logger'

interface WorkerPayoutJob {
  paymentId: string
  bookingId: string
  workerId: string
  amount: number
  currency: string
}

function buildRedisConnection() {
  const redisUrl = new URL(env.REDIS_URL)
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: redisUrl.pathname ? Number(redisUrl.pathname.slice(1) || 0) : 0,
    maxRetriesPerRequest: null,
  }
}

function createPayoutQueue() {
  return new Queue<WorkerPayoutJob>('worker-payouts', {
    connection: buildRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    },
  })
}

let payoutQueue: ReturnType<typeof createPayoutQueue> | null = null

function getPayoutQueue() {
  if (!payoutQueue) {
    payoutQueue = createPayoutQueue()
  }

  return payoutQueue
}

export async function queueWorkerPayoutJob(job: WorkerPayoutJob) {
  const queue = getPayoutQueue()
  const queuedJob = await queue.add('release-worker-payout', job, {
    jobId: `payout:${job.paymentId}`,
  })

  logger.info('Worker payout job queued', {
    jobId: queuedJob.id,
    paymentId: job.paymentId,
    bookingId: job.bookingId,
    workerId: job.workerId,
    amount: job.amount,
  })

  return queuedJob
}
