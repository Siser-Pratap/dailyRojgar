import { Job, Worker } from 'bullmq'
import { QUEUE_CONCURRENCY, SmsJob, buildRedisConnection } from '../queues'
import { UserModel } from '../models/User.model'
import { env } from '../config/env'
import { logger } from '../utils/logger'

async function processSmsJob(job: Job<SmsJob>) {
  const user = await UserModel.findById(job.data.userId).select('phone name').lean()
  if (!user?.phone) {
    logger.warn('SMS job skipped: user phone not found', { jobId: job.id, userId: job.data.userId })
    return { skipped: true, reason: 'missing_phone' }
  }

  if (!env.MSG91_AUTH_KEY) {
    logger.info('SMS job dry-run: MSG91 is not configured', {
      to: user.phone,
      message: job.data.message,
      userId: job.data.userId,
    })
    return { dryRun: true, to: user.phone }
  }

  const response = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: env.MSG91_AUTH_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      template_id: env.MSG91_TEMPLATE_ID,
      sender: env.MSG91_SENDER_ID,
      mobiles: user.phone,
      message: job.data.message,
    }),
  })

  if (!response.ok) {
    throw new Error(`MSG91 request failed with status ${response.status}`)
  }

  const result = await response.json().catch(() => ({}))
  logger.info('SMS sent', { jobId: job.id, to: user.phone })
  return result
}

export function createSmsWorker() {
  const worker = new Worker<SmsJob>('sms-queue', processSmsJob, {
    connection: buildRedisConnection(),
    concurrency: QUEUE_CONCURRENCY,
  })

  worker.on('failed', (job, err) => {
    logger.error('SMS job failed', { jobId: job?.id, error: err.message })
  })

  return worker
}
