import apiClient from '@/lib/axios'

export type NotificationType = 'booking' | 'payment' | 'review' | 'system'

export interface AppNotification {
  _id: string
  title: string
  message: string
  type: NotificationType
  data?: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

export interface ListNotificationsParams {
  unreadOnly?: boolean
  page?: number
  limit?: number
}

export interface ListNotificationsResult {
  items: AppNotification[]
  page: number
  limit: number
  total: number
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T> {
  meta: { page: number; limit: number; total: number }
}

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<ListNotificationsResult> {
  const query: Record<string, string | number | boolean> = {}
  if (params.unreadOnly) query.unreadOnly = true
  if (params.page) query.page = params.page
  if (params.limit) query.limit = params.limit
  const { data } = await apiClient.get<PaginatedEnvelope<AppNotification[]>>('/notifications', {
    params: query,
  })
  return { items: data.data, ...data.meta }
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await apiClient.patch<ApiEnvelope<AppNotification>>(`/notifications/${id}/read`)
  return data.data
}

export async function markAllNotificationsRead(): Promise<{ modifiedCount: number }> {
  const { data } =
    await apiClient.patch<ApiEnvelope<{ modifiedCount: number }>>('/notifications/read-all')
  return data.data
}
