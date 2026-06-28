import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, StatusBadge, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBookings } from '@/features/booking/hooks'

const activeStatuses = ['accepted', 'in_progress']

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useBookings({ limit: 50 })

  const bookings = data?.items ?? []
  const active = bookings.filter((b) => activeStatuses.includes(b.status))
  const pending = bookings.filter((b) => b.status === 'pending')
  const completed = bookings.filter((b) => b.status === 'completed')
  const totalSpend = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0)

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">
            Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-600">Your bookings at a glance.</p>
        </div>
        <Link to={ROUTES.CUSTOMER_SEARCH}>
          <Button>Find workers</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Active" value={String(active.length)} loading={isLoading} />
        <Metric label="Pending" value={String(pending.length)} loading={isLoading} />
        <Metric label="Completed" value={String(completed.length)} loading={isLoading} />
        <Metric label="Total spend" value={formatCurrency(totalSpend)} loading={isLoading} />
      </div>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Recent bookings</h2>
          <Link to={ROUTES.CUSTOMER_BOOKINGS}>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No bookings yet"
            description="Find a worker and make your first booking."
            action={
              <Link to={ROUTES.CUSTOMER_SEARCH}>
                <Button>Find workers</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-3">
            {bookings.slice(0, 5).map((booking) => (
              <Link
                key={booking._id}
                to={buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking._id })}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-primary-50/40">
                  <div>
                    <p className="font-semibold text-gray-950">
                      {booking.categoryId} with {booking.workerId.name}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(booking.scheduledDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={booking.status} />
                    <span className="font-bold text-gray-950">
                      {formatCurrency(booking.totalAmount)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

function Metric({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-7 w-16" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
      )}
    </Card>
  )
}
