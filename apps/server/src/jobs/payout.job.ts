import { Job, Worker } from 'bullmq'
import { QUEUE_CONCURRENCY, WorkerPayoutJob, buildRedisConnection } from '../queues'
import { logger } from '../utils/logger'
import { recordPayoutLatency } from '../services/metrics.service'

async function processPayoutJob(job: Job<WorkerPayoutJob>) {
  // Phase 10 queues the payout independently. Actual bank transfer provider
  // integration belongs to a later payout/finance hardening task.
  recordPayoutLatency('payout-queue', Date.now() - job.timestamp)

  logger.info('Worker payout job processed', {
    jobId: job.id,
    paymentId: job.data.paymentId,
    bookingId: job.data.bookingId,
    workerId: job.data.workerId,
    amount: job.data.amount,
    currency: job.data.currency,
  })

  return { processed: true, ...job.data }
}

export function createPayoutWorker() {
  const worker = new Worker<WorkerPayoutJob>('payout-queue', processPayoutJob, {
    connection: buildRedisConnection(),
    concurrency: QUEUE_CONCURRENCY,
  })

  worker.on('failed', (job, err) => {
    logger.error('Payout job failed', { jobId: job?.id, error: err.message })
  })

  return worker
}
