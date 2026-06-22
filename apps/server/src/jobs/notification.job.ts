import { Job, Worker } from 'bullmq'
import { InAppNotificationJob, QUEUE_CONCURRENCY, buildRedisConnection } from '../queues'
import { NotificationModel } from '../models/Notification.model'
import { UserModel } from '../models/User.model'
import { emitNewNotification } from '../sockets/socket.service'
import { logger } from '../utils/logger'

async function processNotificationJob(job: Job<InAppNotificationJob>) {
  const notification = await NotificationModel.create({
    userId: job.data.userId,
    title: job.data.title,
    message: job.data.message,
    type: job.data.type,
    data: job.data.data ?? {},
  })

  emitNewNotification(job.data.userId, notification.toObject())

  const user = await UserModel.findById(job.data.userId).select('fcmTokens').lean()
  const fcmTokens = (user as { fcmTokens?: string[] } | null)?.fcmTokens ?? []
  if (fcmTokens.length > 0) {
    logger.info('FCM push notification ready for Firebase integration', {
      userId: job.data.userId,
      tokenCount: fcmTokens.length,
      notificationId: notification._id.toString(),
    })
  }

  return notification.toObject()
}

export function createNotificationWorker() {
  const worker = new Worker<InAppNotificationJob>('notification-queue', processNotificationJob, {
    connection: buildRedisConnection(),
    concurrency: QUEUE_CONCURRENCY,
  })

  worker.on('failed', (job, err) => {
    logger.error('Notification job failed', { jobId: job?.id, error: err.message })
  })

  return worker
}
