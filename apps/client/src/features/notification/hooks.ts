import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from './api'

const POLL_MS = 30_000

/** Recent notifications for the current user (polled while authenticated). */
export function useNotifications(limit = 10) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['notifications', { limit }],
    queryFn: () => listNotifications({ limit }),
    enabled: isAuthenticated,
    refetchInterval: POLL_MS,
  })
}

/** Unread count via the list meta (cheap: limit 1, unreadOnly). */
export function useUnreadCount() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => listNotifications({ unreadOnly: true, limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: POLL_MS,
    select: (data) => data.total,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
