import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Skeleton } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { formatCurrency } from '@/lib/utils'
import { fetchAdminDashboard } from '../api'

export default function AdminDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  })

  if (isError) {
    return (
      <DashboardLayout>
        <ErrorState title="Could not load metrics" onRetry={() => refetch()} />
      </DashboardLayout>
    )
  }

  const metrics = [
    { label: 'Total users', value: data && String(data.users) },
    { label: 'Active workers', value: data && String(data.activeWorkers) },
    { label: 'Bookings today', value: data && String(data.bookingsToday) },
    { label: 'Revenue today', value: data && formatCurrency(data.revenueToday) },
  ]

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Admin overview</h1>
        <p className="mt-1 text-sm text-gray-600">Live platform metrics and review queues.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="p-5">
            <p className="text-sm text-gray-500">{m.label}</p>
            {isLoading || !m.value ? (
              <Skeleton className="mt-2 h-7 w-20" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-gray-950">{m.value}</p>
            )}
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-950">Worker verifications</h2>
          <p className="mt-1 text-sm text-gray-600">
            {data ? `${data.pendingVerifications} pending review` : 'Loading…'}
          </p>
          <Link to={ROUTES.ADMIN_WORKERS}>
            <Button className="mt-4" size="sm">
              Review queue
            </Button>
          </Link>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-950">Open disputes</h2>
          <p className="mt-1 text-sm text-gray-600">
            {data ? `${data.pendingDisputes} awaiting resolution` : 'Loading…'}
          </p>
          <Link to={ROUTES.ADMIN_REPORTS}>
            <Button className="mt-4" size="sm" variant="outline">
              View disputes
            </Button>
          </Link>
        </Card>
      </div>
    </DashboardLayout>
  )
}
