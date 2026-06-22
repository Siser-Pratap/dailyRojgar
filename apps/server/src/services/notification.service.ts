import { Types } from 'mongoose'
import {
  EmailJob,
  InAppNotificationJob,
  SmsJob,
  getEmailQueue,
  getNotificationQueue,
  getSmsQueue,
} from '../queues'
import { NotificationModel } from '../models/Notification.model'
import { UserModel } from '../models/User.model'
import { parsePagination } from '../utils/pagination'
import { logger } from '../utils/logger'

export type NotificationEvent =
  | 'booking.created'
  | 'booking.accepted'
  | 'booking.rejected'
  | 'job.started'
  | 'job.completed'
  | 'payment.received'
  | 'review.received'
  | 'worker.approved'
  | 'worker.rejected'
  | 'system.notification'

interface NotificationInput {
  userId: string | Types.ObjectId
  title: string
  message: string
  type?: 'booking' | 'payment' | 'review' | 'system'
  data?: Record<string, unknown>
}

const EVENT_CHANNELS: Record<NotificationEvent, { inApp: boolean; email: boolean; sms: boolean }> =
  {
    'booking.created': { inApp: true, email: true, sms: true },
    'booking.accepted': { inApp: true, email: true, sms: true },
    'booking.rejected': { inApp: true, email: false, sms: true },
    'job.started': { inApp: true, email: false, sms: false },
    'job.completed': { inApp: true, email: true, sms: false },
    'payment.received': { inApp: true, email: true, sms: true },
    'review.received': { inApp: true, email: false, sms: false },
    'worker.approved': { inApp: true, email: true, sms: true },
    'worker.rejected': { inApp: true, email: true, sms: true },
    'system.notification': { inApp: true, email: false, sms: false },
  }

function buildJobId(prefix: string, userId: string, title: string, data?: Record<string, unknown>) {
  const entityId =
    data?.bookingId ?? data?.paymentId ?? data?.reviewId ?? data?.workerId ?? Date.now()
  return `${prefix}:${userId}:${entityId}:${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export async function createNotification(input: NotificationInput) {
  const userId = input.userId.toString()
  const job: InAppNotificationJob = {
    userId,
    title: input.title,
    message: input.message,
    type: input.type ?? 'system',
    data: input.data ?? {},
  }

  const queuedJob = await getNotificationQueue().add('create-in-app-notification', job, {
    jobId: buildJobId('in-app', userId, input.title, input.data),
  })

  logger.info('In-app notification queued', { jobId: queuedJob.id, userId, title: input.title })
  return { queued: true, jobId: queuedJob.id, ...job }
}

export async function dispatchNotificationEvent(
  event: NotificationEvent,
  input: NotificationInput & { emailSubject?: string; html?: string },
) {
  const userId = input.userId.toString()
  const channels = EVENT_CHANNELS[event]
  const queuedJobs: Array<Promise<unknown>> = []

  if (channels.inApp) {
    queuedJobs.push(createNotification(input))
  }

  if (channels.email) {
    const emailJob: EmailJob = {
      userId,
      subject: input.emailSubject ?? input.title,
      text: input.message,
      html: input.html,
      data: { event, ...(input.data ?? {}) },
    }
    queuedJobs.push(
      getEmailQueue().add('send-email', emailJob, {
        jobId: buildJobId('email', userId, input.title, input.data),
      }),
    )
  }

  if (channels.sms) {
    const smsJob: SmsJob = {
      userId,
      message: input.message,
      data: { event, ...(input.data ?? {}) },
    }
    queuedJobs.push(
      getSmsQueue().add('send-sms', smsJob, {
        jobId: buildJobId('sms', userId, input.title, input.data),
      }),
    )
  }

  await Promise.all(queuedJobs)
  logger.info('Notification event dispatched', { event, userId, channels })
  return { event, userId, channels }
}

export async function registerFcmToken(userId: string, token: string) {
  await UserModel.findByIdAndUpdate(userId, {
    $addToSet: { fcmTokens: token },
  })
  return { registered: true }
}

export async function listMyNotifications(
  userId: string,
  query: { unreadOnly?: boolean; page?: number; limit?: number },
) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = { userId }
  if (query.unreadOnly) filter.readAt = null

  const [items, total] = await Promise.all([
    NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    NotificationModel.countDocuments(filter),
  ])

  return { items, total, ...pagination }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return NotificationModel.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { readAt: new Date() } },
    { new: true },
  ).lean()
}

export async function markAllNotificationsRead(userId: string) {
  const result = await NotificationModel.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } },
  )
  return { modifiedCount: result.modifiedCount }
}
