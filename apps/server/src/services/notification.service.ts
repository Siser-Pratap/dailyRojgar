import { Types } from 'mongoose'
import { NotificationModel } from '../models/Notification.model'
import { parsePagination } from '../utils/pagination'

export async function createNotification(input: {
  userId: string | Types.ObjectId
  title: string
  message: string
  type?: 'booking' | 'payment' | 'review' | 'system'
  data?: Record<string, unknown>
}) {
  return NotificationModel.create({
    userId: input.userId,
    title: input.title,
    message: input.message,
    type: input.type ?? 'system',
    data: input.data ?? {},
  })
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
