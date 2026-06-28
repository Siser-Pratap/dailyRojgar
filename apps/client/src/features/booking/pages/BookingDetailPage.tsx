import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Avatar, Button, Card, PageSpinner, StatusBadge } from '@/components/ui'
import { ConfirmDialog, ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBooking, useCancelBooking } from '../hooks'
import { StatusTimeline } from '../components/StatusTimeline'
import { ReviewForm } from '@/features/review/components/ReviewForm'
import { useBookingReview } from '@/features/review/hooks'

const cancellableStatuses = ['pending', 'accepted']

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { data: booking, isLoading, isError, refetch } = useBooking(id)
  const cancelMutation = useCancelBooking()
  const { data: existingReview, isLoading: reviewLoading } = useBookingReview(id)

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !booking) {
    return (
      <DashboardLayout>
        <ErrorState title="Booking not found" onRetry={() => refetch()} />
      </DashboardLayout>
    )
  }

  const canCancel = cancellableStatuses.includes(booking.status)
  const canPay =
    (booking.status === 'accepted' || booking.status === 'in_progress') &&
    booking.paymentStatus !== 'paid'
  const address = [booking.address.street, booking.address.city, booking.address.pincode]
    .filter(Boolean)
    .join(', ')

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={ROUTES.CUSTOMER_BOOKINGS} className="text-sm text-primary-700">
            ← Back to bookings
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">{booking.bookingNumber}</h1>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar name={booking.workerId.name} src={booking.workerId.profileImage} size="md" />
              <div>
                <p className="font-semibold text-gray-950">{booking.workerId.name}</p>
                <p className="text-sm text-gray-500">{booking.categoryId}</p>
              </div>
            </div>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Scheduled" value={formatDate(booking.scheduledDate)} />
              <Detail
                label="Duration"
                value={`${booking.durationDays} day${booking.durationDays > 1 ? 's' : ''}`}
              />
              <Detail label="Location" value={address || '—'} />
              <Detail label="Payment" value={booking.paymentStatus.replace(/_/g, ' ')} />
            </dl>
            {booking.description && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Work description</p>
                <p className="mt-1 text-sm text-gray-600">{booking.description}</p>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-950">Status timeline</h2>
            <StatusTimeline history={booking.statusHistory} />
          </Card>

          {booking.status === 'completed' && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-950">Your review</h2>
              {reviewLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : existingReview ? (
                <div>
                  <p className="text-yellow-500">{'★'.repeat(existingReview.rating)}</p>
                  {existingReview.comment && (
                    <p className="mt-1 text-sm text-gray-700">"{existingReview.comment}"</p>
                  )}
                  {existingReview.reply?.text && (
                    <div className="mt-3 rounded-md border-l-2 border-primary-300 bg-gray-50 p-3 text-sm">
                      <p className="font-medium text-gray-700">{booking.workerId.name} replied</p>
                      <p className="mt-0.5 text-gray-600">{existingReview.reply.text}</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="mb-3 text-sm text-gray-600">
                    How was your experience with {booking.workerId.name}?
                  </p>
                  <ReviewForm bookingId={booking._id} workerId={booking.workerId._id} />
                </>
              )}
            </Card>
          )}
        </div>

        <aside className="grid h-fit gap-4">
          <Card className="p-6">
            <h2 className="mb-3 text-lg font-bold text-gray-950">Payment summary</h2>
            <div className="grid gap-2 text-sm">
              <Row label="Service amount" value={formatCurrency(booking.amount)} />
              <Row label="Platform fee" value={formatCurrency(booking.platformFee)} />
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-semibold text-gray-950">Total</span>
                <span className="font-bold text-gray-950">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {canPay && (
            <Link to={buildRoute(ROUTES.CUSTOMER_PAYMENT, { bookingId: booking._id })}>
              <Button size="lg" fullWidth>
                Pay {formatCurrency(booking.totalAmount)}
              </Button>
            </Link>
          )}
          <Link to={buildRoute(ROUTES.CUSTOMER_CHAT, { bookingId: booking._id })}>
            <Button variant="outline" fullWidth>
              Message worker
            </Button>
          </Link>
          {canCancel && (
            <Button variant="danger" fullWidth onClick={() => setConfirmOpen(true)}>
              Cancel booking
            </Button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel this booking?"
        description="This cannot be undone. The worker will be notified."
        confirmLabel="Cancel booking"
        danger
        isLoading={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate({ id: booking._id }, { onSuccess: () => setConfirmOpen(false) })
        }
      />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
