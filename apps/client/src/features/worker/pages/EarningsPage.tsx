import { DashboardLayout } from '@/components/layout'
import { Card, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBookings } from '@/features/booking/hooks'
import { useWorkerStats } from '../hooks'

export default function WorkerEarnings() {
  const { data: stats, isLoading: statsLoading } = useWorkerStats()
  const { data: completedData, isLoading: jobsLoading } = useBookings({
    status: 'completed',
    limit: 20,
  })

  const completed = completedData?.items ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Earnings</h1>
        <p className="mt-1 text-sm text-gray-600">Your completed jobs and total payout.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Total earnings"
          value={stats ? formatCurrency(stats.totalEarnings) : undefined}
          loading={statsLoading}
        />
        <Metric
          label="Completed jobs"
          value={stats ? String(stats.completedJobs) : undefined}
          loading={statsLoading}
        />
        <Metric
          label="Active jobs"
          value={stats ? String(stats.activeJobs) : undefined}
          loading={statsLoading}
        />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-950">Completed jobs</h2>
        {jobsLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : completed.length === 0 ? (
          <EmptyState
            icon="💰"
            title="No earnings yet"
            description="Completed jobs and their payouts will appear here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {completed.map((job) => (
              <div key={job._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">
                    {job.categoryId} • {job.customerId.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {job.completedAt ? formatDate(job.completedAt) : formatDate(job.scheduledDate)}
                  </p>
                </div>
                <span className="font-semibold text-gray-950">{formatCurrency(job.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}

function Metric({ label, value, loading }: { label: string; value?: string; loading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      {loading || value === undefined ? (
        <Skeleton className="mt-2 h-7 w-24" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
      )}
    </Card>
  )
}
