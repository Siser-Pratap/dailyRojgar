import { Worker } from 'bullmq'
import { createEmailWorker } from './email.job'
import { createSmsWorker } from './sms.job'
import { createNotificationWorker } from './notification.job'
import { createPayoutWorker } from './payout.job'
import { logger } from '../utils/logger'

let workers: Worker[] = []

export function startQueueWorkers() {
  if (workers.length > 0) return workers

  workers = [
    createEmailWorker(),
    createSmsWorker(),
    createNotificationWorker(),
    createPayoutWorker(),
  ]
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
