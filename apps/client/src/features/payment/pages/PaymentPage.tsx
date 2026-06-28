import { Link, useNavigate, useParams } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, PageSpinner, StatusBadge } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBooking } from '@/features/booking/hooks'
import { useRazorpayCheckout } from '../hooks'

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading, isError, refetch } = useBooking(bookingId)
  const { startPayment, isProcessing } = useRazorpayCheckout()

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

  const detailHref = buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking._id })
  const isPaid = booking.paymentStatus === 'paid'

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to={detailHref} className="text-sm text-primary-700">
          ← Back to booking
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-gray-950">Secure payment</h1>
      </div>

      <div className="grid max-w-3xl gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-950">{booking.bookingNumber}</p>
              <p className="text-sm text-gray-500">
                {booking.categoryId} with {booking.workerId.name} •{' '}
                {formatDate(booking.scheduledDate)}
              </p>
            </div>
            <StatusBadge status={booking.paymentStatus} />
          </div>

          <div className="mt-6">
            {isPaid ? (
              <div className="rounded-lg bg-primary-50 p-4 text-sm text-primary-800">
                <p className="font-semibold">This booking is already paid.</p>
                <Link to={detailHref}>
                  <Button className="mt-3">View booking</Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Pay securely with UPI, cards, or netbanking via Razorpay. Your payment is verified
                  on our server before the booking is confirmed.
                </p>
                <Button
                  size="lg"
                  className="mt-5"
                  isLoading={isProcessing}
                  onClick={() =>
                    startPayment(booking._id, {
                      description: `Booking ${booking.bookingNumber}`,
                      onSuccess: () => navigate(detailHref),
                    })
                  }
                >
                  Pay {formatCurrency(booking.totalAmount)}
                </Button>
              </>
            )}
          </div>
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-950">Pricing summary</h2>
          <div className="grid gap-2 text-sm">
            <Row label="Service amount" value={formatCurrency(booking.amount)} />
            <Row label="Platform fee" value={formatCurrency(booking.platformFee)} />
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-semibold text-gray-950">Total</span>
              <span className="font-bold text-gray-950">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
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
