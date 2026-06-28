import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { cn, formatDate } from '@/lib/utils'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../hooks'
import type { AppNotification } from '../api'

const typeIcon: Record<AppNotification['type'], string> = {
  booking: '📋',
  payment: '💳',
  review: '⭐',
  system: '🔔',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { role } = useAuth()

  const { data, isLoading } = useNotifications()
  const { data: unreadCount = 0 } = useUnreadCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const notifications = data?.items ?? []

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleClick = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification._id)
    const bookingId = notification.data?.bookingId
    if (typeof bookingId === 'string') {
      setOpen(false)
      navigate(
        role === 'worker'
          ? buildRoute(ROUTES.WORKER_JOB_DETAIL, { id: bookingId })
          : buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: bookingId }),
      )
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="font-semibold text-gray-950">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-medium text-primary-700 hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'flex w-full gap-3 border-b border-gray-50 px-4 py-3 text-left transition hover:bg-gray-50',
                    !n.readAt && 'bg-primary-50/50',
                  )}
                >
                  <span className="text-lg">{typeIcon[n.type]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-gray-600">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      {formatDate(n.createdAt, {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.readAt && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
