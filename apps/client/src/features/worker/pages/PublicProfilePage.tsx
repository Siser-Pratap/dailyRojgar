import { useNavigate, useParams } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { PublicLayout } from '@/components/layout'
import { Avatar, Badge, Button, Card, PageSpinner } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useWorkerProfile, useWorkerReviews } from '../hooks'
import type { WorkerReview } from '../api'

export default function WorkerPublicProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()

  const { data: worker, isLoading, isError, refetch } = useWorkerProfile(id)
  const { data: reviews = [] } = useWorkerReviews(id)

  const handleBookNow = () => {
    if (!worker) return
    // Carry the worker into the booking flow (F4). Unauthenticated users are
    // sent to login first, preserving their intent.
    if (!isAuthenticated || role !== 'customer') {
      navigate(ROUTES.LOGIN, { state: { from: `/workers/${id}` } })
      return
    }
    navigate(buildRoute(ROUTES.CUSTOMER_BOOK_NEW, { workerId: worker.userId._id }), {
      state: {
        bookWorker: {
          id: worker.userId._id,
          name: worker.userId.name,
          categoryId: worker.categoryId,
          pricePerDay: worker.pricePerDay,
        },
      },
    })
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <PageSpinner />
      </PublicLayout>
    )
  }

  if (isError || !worker) {
    return (
      <PublicLayout>
        <div className="container py-12">
          <ErrorState
            title="Worker not found"
            description="This profile may have been removed or is unavailable."
            onRetry={() => refetch()}
          />
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-start gap-5">
                <Avatar name={worker.userId.name} src={worker.userId.profileImage} size="lg" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-950">{worker.userId.name}</h1>
                    <Badge variant={worker.isAvailable ? 'green' : 'gray'}>
                      {worker.isAvailable ? 'Available' : 'Busy'}
                    </Badge>
                    {worker.verificationStatus === 'approved' && (
                      <Badge variant="green">Verified</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-gray-600">
                    {worker.categoryId} specialist
                    {worker.userId.address && ` • ${worker.userId.address}`}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Metric
                      label="Rating"
                      value={`★ ${worker.rating.average.toFixed(1)} (${worker.rating.totalReviews})`}
                    />
                    <Metric label="Completed jobs" value={String(worker.totalJobs)} />
                    <Metric label="Experience" value={`${worker.experienceYears} yr`} />
                  </div>
                </div>
              </div>
              {worker.bio && <p className="mt-5 text-gray-700">{worker.bio}</p>}
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-950">Skills</h2>
              {worker.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills listed.</p>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-950">
                Customer reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <EmptyState
                  icon="💬"
                  title="No reviews yet"
                  description="This worker hasn't received any reviews."
                />
              ) : (
                <div className="grid gap-3">
                  {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                  ))}
                </div>
              )}
            </Card>
          </div>

          <aside className="card h-fit p-6 lg:sticky lg:top-24">
            <p className="text-sm text-gray-500">Starting from</p>
            <p className="text-3xl font-bold text-gray-950">
              {formatCurrency(worker.pricePerDay)}
              <span className="text-sm font-medium text-gray-500">/day</span>
            </p>
            <Button
              size="lg"
              fullWidth
              className="mt-5"
              onClick={handleBookNow}
              disabled={!worker.isAvailable}
            >
              {worker.isAvailable ? 'Book now' : 'Currently unavailable'}
            </Button>
            {!isAuthenticated && (
              <p className="mt-3 text-center text-xs text-gray-500">
                You'll be asked to log in to complete a booking.
              </p>
            )}
          </aside>
        </div>
      </div>
    </PublicLayout>
  )
}

function ReviewItem({ review }: { review: WorkerReview }) {
  const reviewer = typeof review.customerId === 'object' ? review.customerId.name : 'Customer'

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-yellow-600">{'★'.repeat(review.rating)}</p>
        <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
      </div>
      {review.comment && <p className="mt-1 text-gray-700">"{review.comment}"</p>}
      <p className="mt-2 text-sm text-gray-500">— {reviewer}</p>
      {review.reply?.text && (
        <div className="mt-3 rounded-md border-l-2 border-primary-300 bg-white p-3 text-sm">
          <p className="font-medium text-gray-700">Worker's reply</p>
          <p className="mt-0.5 text-gray-600">{review.reply.text}</p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-gray-950">{value}</p>
    </div>
  )
}
