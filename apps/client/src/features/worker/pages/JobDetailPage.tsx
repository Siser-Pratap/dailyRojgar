import { Link, useParams } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Avatar, Button, Card, PageSpinner, StatusBadge } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBooking, useWorkerBookingAction } from '@/features/booking/hooks'
import { StatusTimeline } from '@/features/booking/components/StatusTimeline'

export default function WorkerJobDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading, isError, refetch } = useBooking(id)
  const actionMutation = useWorkerBookingAction()

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !job) {
    return (
      <DashboardLayout>
        <ErrorState title="Job not found" onRetry={() => refetch()} />
      </DashboardLayout>
    )
  }

  const address = [job.address.street, job.address.city, job.address.pincode]
    .filter(Boolean)
    .join(', ')
  const isBusy = actionMutation.isPending

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={ROUTES.WORKER_JOBS} className="text-sm text-primary-700">
            ← Back to jobs
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">{job.bookingNumber}</h1>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar name={job.customerId.name} src={job.customerId.profileImage} size="md" />
              <div>
                <p className="font-semibold text-gray-950">{job.customerId.name}</p>
                {job.customerId.phone && (
                  <p className="text-sm text-gray-500">{job.customerId.phone}</p>
                )}
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Category" value={job.categoryId} />
              <Detail label="Scheduled" value={formatDate(job.scheduledDate)} />
              <Detail
                label="Duration"
                value={`${job.durationDays} day${job.durationDays > 1 ? 's' : ''}`}
              />
              <Detail label="Location" value={address || '—'} />
              <Detail label="Earnings" value={formatCurrency(job.amount)} />
              <Detail label="Payment" value={job.paymentStatus.replace(/_/g, ' ')} />
            </dl>
            {job.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Work description</p>
                <p className="mt-1 text-sm text-gray-600">{job.description}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-950">Status timeline</h2>
            <StatusTimeline history={job.statusHistory} />
          </Card>
        </div>

        <aside className="grid h-fit gap-3">
          <Card className="p-5">
            <h2 className="mb-3 font-bold text-gray-950">Actions</h2>
            <div className="grid gap-2">
              {job.status === 'pending' && (
                <>
                  <Button
                    fullWidth
                    isLoading={isBusy}
                    onClick={() => actionMutation.mutate({ id: job._id, action: 'accept' })}
                  >
                    Accept job
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    disabled={isBusy}
                    onClick={() => actionMutation.mutate({ id: job._id, action: 'reject' })}
                  >
                    Reject
                  </Button>
                </>
              )}
              {job.status === 'accepted' && (
                <Button
                  fullWidth
                  isLoading={isBusy}
                  onClick={() => actionMutation.mutate({ id: job._id, action: 'start' })}
                >
                  Start work
                </Button>
              )}
              {job.status === 'in_progress' && (
                <Button
                  fullWidth
                  isLoading={isBusy}
                  onClick={() => actionMutation.mutate({ id: job._id, action: 'complete' })}
                >
                  Mark complete
                </Button>
              )}
              {['completed', 'cancelled', 'rejected', 'disputed'].includes(job.status) && (
                <p className="text-sm text-gray-500">No actions available for this job.</p>
              )}
              <Link to={buildRoute(ROUTES.WORKER_CHAT, { bookingId: job._id })}>
                <Button variant="outline" fullWidth>
                  Open chat
                </Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </DashboardLayout>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  )
}
