import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, StatusBadge, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBookings } from '@/features/booking/hooks'
import { useUpdateAvailability, useWorkerStats } from '../hooks'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading: statsLoading, isError: statsError } = useWorkerStats()
  const { data: jobsData, isLoading: jobsLoading } = useBookings({ limit: 5 })
  const availability = useUpdateAvailability(user?._id)

  const jobs = jobsData?.items ?? []

  if (statsError) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="🧰"
          title="Set up your worker profile"
          description="Add your skills, rate, and location so customers can find and book you."
          action={
            <Link to={ROUTES.WORKER_PROFILE_EDIT}>
              <Button>Complete profile</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-950">Dashboard</h1>
        {stats && (
          <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
            <span>Available for work</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-primary-600"
              checked={stats.isAvailable}
              disabled={availability.isPending}
              onChange={(e) => availability.mutate(e.target.checked)}
            />
          </label>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Active jobs"
          value={stats ? String(stats.activeJobs) : undefined}
          loading={statsLoading}
        />
        <Metric
          label="Completed jobs"
          value={stats ? String(stats.completedJobs) : undefined}
          loading={statsLoading}
        />
        <Metric
          label="Total earnings"
          value={stats ? formatCurrency(stats.totalEarnings) : undefined}
          loading={statsLoading}
        />
        <Metric
          label="Rating"
          value={
            stats ? `${stats.rating.average.toFixed(1)}★ (${stats.rating.totalReviews})` : undefined
          }
          loading={statsLoading}
        />
      </div>

      <Card className="mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-950">Recent jobs</h2>
          <Link to={ROUTES.WORKER_JOBS}>
            <Button variant="outline" size="sm">
              All jobs
            </Button>
          </Link>
        </div>
        {jobsLoading ? (
          <div className="grid gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No jobs yet.</p>
        ) : (
          <div className="grid gap-3">
            {jobs.map((job) => (
              <Link key={job._id} to={buildRoute(ROUTES.WORKER_JOB_DETAIL, { id: job._id })}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-primary-50/40">
                  <div>
                    <p className="font-semibold text-gray-950">
                      {job.categoryId} for {job.customerId.name}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(job.scheduledDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} />
                    <span className="font-bold text-gray-950">{formatCurrency(job.amount)}</span>
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

function Metric({ label, value, loading }: { label: string; value?: string; loading?: boolean }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      {loading || value === undefined ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
      )}
    </Card>
  )
}
