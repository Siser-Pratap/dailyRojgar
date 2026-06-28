import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import { Card, StatusBadge, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { fetchAdminBookings } from '../api'

export default function AdminBookings() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => fetchAdminBookings(),
  })

  const bookings = data ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">All bookings</h1>
        <p className="mt-1 text-sm text-gray-600">Platform-wide booking ledger.</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : bookings.length === 0 ? (
        <EmptyState icon="📋" title="No bookings yet" />
      ) : (
        <Card className="divide-y divide-gray-100 p-0">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">{booking.bookingNumber}</p>
                <p className="text-sm text-gray-500">
                  {booking.categoryId} • {booking.customerId?.name ?? 'Customer'} →{' '}
                  {booking.workerId?.name ?? 'Worker'} • {formatDate(booking.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={booking.paymentStatus} />
                <StatusBadge status={booking.status} />
                <span className="font-bold text-gray-950">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}
    </DashboardLayout>
  )
}
