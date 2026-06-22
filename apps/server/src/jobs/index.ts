import { Worker } from 'bullmq'
import { createEmailWorker } from './email.job'
import { createSmsWorker } from './sms.job'
import { createNotificationWorker } from './notification.job'
import { createPayoutWorker } from './payout.job'
import { logger } from '../utils/logger'
import { recordQueueJob } from '../services/metrics.service'

let workers: Worker[] = []

function observeWorker(worker: Worker, queueName: string) {
  const startedAt = new Map<string, number>()

  worker.on('active', (job) => {
    if (job?.id) startedAt.set(job.id, Date.now())
  })

  worker.on('completed', (job) => {
    const started = job?.id ? startedAt.get(job.id) : undefined
    if (job?.id) startedAt.delete(job.id)
    recordQueueJob({
      queueName,
      status: 'completed',
      durationMs: started ? Date.now() - started : undefined,
    })
  })

  worker.on('failed', (job) => {
    const started = job?.id ? startedAt.get(job.id) : undefined
    if (job?.id) startedAt.delete(job.id)
    recordQueueJob({
      queueName,
      status: 'failed',
      durationMs: started ? Date.now() - started : undefined,
    })
  })
}

export function startQueueWorkers() {
  if (workers.length > 0) return workers

  workers = [
    createEmailWorker(),
    createSmsWorker(),
    createNotificationWorker(),
    createPayoutWorker(),
  ]
  ;['email-queue', 'sms-queue', 'notification-queue', 'payout-queue'].forEach(
    (queueName, index) => {
      observeWorker(workers[index], queueName)
    },
  )
  logger.info('Queue workers started', {
    queues: ['email-queue', 'sms-queue', 'notification-queue', 'payout-queue'],
    concurrency: 5,
  })
  return workers
}

export async function stopQueueWorkers() {
  await Promise.all(workers.map((worker) => worker.close()))
  workers = []
  logger.info('Queue workers stopped')
}
