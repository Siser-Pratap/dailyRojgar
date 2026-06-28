import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, StatusBadge, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBookings } from '../hooks'
import type { BookingStatus } from '../api'

const statusFilters: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BookingsPage() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useBookings(status === 'all' ? {} : { status })

  const bookings = data?.items ?? []

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">My bookings</h1>
          <p className="mt-1 text-sm text-gray-600">Track active, upcoming, and past jobs.</p>
        </div>
        <Link to={ROUTES.CUSTOMER_SEARCH}>
          <Button>Find workers</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={
              'rounded-full px-3 py-1 text-sm font-medium transition ' +
              (status === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No bookings here"
          description="When you book a worker, it will show up in this list."
          action={
            <Link to={ROUTES.CUSTOMER_SEARCH}>
              <Button>Find workers</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3">
          {bookings.map((booking) => (
            <Link
              key={booking._id}
              to={buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking._id })}
            >
              <Card className="p-4 transition hover:border-primary-300 hover:bg-primary-50/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-950">
                      {booking.categoryId} with {booking.workerId.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.bookingNumber} • {formatDate(booking.scheduledDate)} •{' '}
                      {booking.durationDays} day{booking.durationDays > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={booking.status} />
                    <span className="font-bold text-gray-950">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
