import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Card, StatusBadge, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBookings } from '@/features/booking/hooks'
import type { BookingStatus } from '@/features/booking/api'

const statusFilters: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Requests', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
]

export default function WorkerJobs() {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all')
  const { data, isLoading, isError, refetch } = useBookings(status === 'all' ? {} : { status })

  const jobs = data?.items ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Jobs</h1>
        <p className="mt-1 text-sm text-gray-600">Incoming requests, active work, and history.</p>
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="🛠️"
          title="No jobs here"
          description="New booking requests from customers will appear here."
        />
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link key={job._id} to={buildRoute(ROUTES.WORKER_JOB_DETAIL, { id: job._id })}>
              <Card className="p-4 transition hover:border-primary-300 hover:bg-primary-50/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-950">
                      {job.categoryId} for {job.customerId.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {job.bookingNumber} • {formatDate(job.scheduledDate)} • {job.durationDays} day
                      {job.durationDays > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={job.status} />
                    <span className="font-bold text-gray-950">{formatCurrency(job.amount)}</span>
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
