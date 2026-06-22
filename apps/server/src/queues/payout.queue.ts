import { getPayoutQueue, WorkerPayoutJob } from './index'
import { logger } from '../utils/logger'

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
