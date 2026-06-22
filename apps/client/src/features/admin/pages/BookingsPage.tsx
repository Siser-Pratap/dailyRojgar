import { useQuery } from '@tanstack/react-query'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { bookings as fallbackBookings } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'
import { fetchAdminBookings } from '../api'

type AnyRecord = Record<string, unknown>

export default function AdminBookings() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => fetchAdminBookings(),
  })
  const bookings: AnyRecord[] = data?.length ? data : (fallbackBookings as unknown as AnyRecord[])

  return (
    <DashboardShell role="Admin" title="All bookings">
      <SectionCard title="Booking ledger">
        {isError && (
          <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
            Using fallback bookings while API is unavailable.
          </p>
        )}
        {isLoading && <div className="mb-3 h-12 animate-pulse rounded bg-gray-100" />}
        <div className="grid gap-3">
          {bookings.map((booking) => {
            const id = String(booking._id ?? booking.id)
            const amount = Number(booking.totalAmount ?? booking.amount ?? 0)
            return (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-950">
                    {String(booking.bookingNumber ?? booking.id)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {String(booking.categoryId ?? booking.category)} • payment:{' '}
                    {String(booking.paymentStatus ?? 'unpaid')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={String(booking.status ?? 'pending')} />
                  <strong>{formatCurrency(amount)}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
