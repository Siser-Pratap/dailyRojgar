import { JobsOptions, Queue } from 'bullmq'
import { env } from '../config/env'

export const QUEUE_CONCURRENCY = 5
export const FAILED_JOB_RETENTION_SECONDS = 72 * 60 * 60

export interface InAppNotificationJob {
  userId: string
  title: string
  message: string
  type: 'booking' | 'payment' | 'review' | 'system'
  data?: Record<string, unknown>
}

export interface EmailJob {
  userId: string
  subject: string
  text: string
  html?: string
  data?: Record<string, unknown>
}

export interface SmsJob {
  userId: string
  message: string
  data?: Record<string, unknown>
}

export interface WorkerPayoutJob {
  paymentId: string
  bookingId: string
  workerId: string
  amount: number
  currency: string
}

export function buildRedisConnection() {
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

export const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 30_000 },
  removeOnComplete: 100,
  removeOnFail: { age: FAILED_JOB_RETENTION_SECONDS },
}

function createQueue<T>(name: string) {
  return new Queue<T>(name, {
    connection: buildRedisConnection(),
    defaultJobOptions,
  })
}

let emailQueue: ReturnType<typeof createQueue<EmailJob>> | null = null
let smsQueue: ReturnType<typeof createQueue<SmsJob>> | null = null
let notificationQueue: ReturnType<typeof createQueue<InAppNotificationJob>> | null = null
let payoutQueue: ReturnType<typeof createQueue<WorkerPayoutJob>> | null = null

export function getEmailQueue() {
  emailQueue ??= createQueue<EmailJob>('email-queue')
  return emailQueue
}

export function getSmsQueue() {
  smsQueue ??= createQueue<SmsJob>('sms-queue')
  return smsQueue
}

export function getNotificationQueue() {
  notificationQueue ??= createQueue<InAppNotificationJob>('notification-queue')
  return notificationQueue
}

export function getPayoutQueue() {
  payoutQueue ??= createQueue<WorkerPayoutJob>('payout-queue')
  return payoutQueue
}

export async function closeQueues() {
  await Promise.all([
    emailQueue?.close(),
    smsQueue?.close(),
    notificationQueue?.close(),
    payoutQueue?.close(),
  ])
  emailQueue = null
  smsQueue = null
  notificationQueue = null
  payoutQueue = null
}

export async function getQueueHealth() {
  const queues = {
    email: getEmailQueue(),
    sms: getSmsQueue(),
    notification: getNotificationQueue(),
    payout: getPayoutQueue(),
  }

  const entries = await Promise.all(
    Object.entries(queues).map(async ([name, queue]) => {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed')
        const active = counts.active ?? 0
        const failed = counts.failed ?? 0
        return [
          name,
          {
            status: failed > 0 ? 'degraded' : 'active',
            waiting: counts.waiting ?? 0,
            active,
            delayed: counts.delayed ?? 0,
            failed,
          },
        ] as const
      } catch (error) {
        return [
          name,
          {
            status: 'unavailable',
            error: error instanceof Error ? error.message : String(error),
          },
        ] as const
      }
    }),
  )

  return Object.fromEntries(entries)
}
