import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardShell, SectionCard, StatCard, StatusBadge } from '@/features/phase8/components'
import { payments, workerJobs } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'
import { fetchAdminDashboard } from '../api'

export default function AdminDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  })

  const metrics = [
    {
      label: 'Total users',
      value: data ? String(data.users) : '12,480',
      change: data ? `+${data.newToday} today` : '+12%',
    },
    {
      label: 'Active workers',
      value: data ? String(data.activeWorkers) : '4,326',
      change: data ? 'approved' : '+8%',
    },
    {
      label: 'Bookings today',
      value: data ? String(data.bookingsToday) : '286',
      change: data ? 'scheduled' : '+18%',
    },
    {
      label: 'Revenue today',
      value: data ? formatCurrency(data.revenueToday) : '₹8.4L',
      change: data ? 'captured' : '+15%',
    },
  ]

  return (
    <DashboardShell role="Admin" title="Metrics overview">
      <div className="grid gap-6">
        {isError && (
          <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
            Live admin metrics unavailable; showing design fallback.
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>
        {isLoading && <div className="card h-24 animate-pulse bg-gray-100" />}
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Worker verification queue"
            action={
              <Link to={ROUTES.ADMIN_WORKERS} className="btn-outline btn-sm">
                Review all
              </Link>
            }
          >
            <div className="grid gap-3">
              {workerJobs.map((job) => (
                <div
                  key={job.customer}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-950">{job.customer}</p>
                    <p className="text-sm text-gray-500">Documents pending</p>
                  </div>
                  <button className="btn-primary btn-sm">Verify</button>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent disputes">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-semibold text-gray-950">
                Pending disputes: {data?.pendingDisputes ?? 1}
              </p>
              <p className="text-sm text-yellow-700">
                Review booking, chat history, and payment before resolving.
              </p>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Transaction feed">
          <div className="grid gap-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-950">{payment.booking}</p>
                  <p className="text-sm text-gray-500">{payment.method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Weekly growth chart">
          <div className="flex h-56 items-end gap-3 rounded-lg bg-gray-50 p-4">
            {[45, 70, 52, 88, 64, 96, 110].map((height, index) => (
              <div key={index} className="flex-1 rounded-t bg-primary-600" style={{ height }} />
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
