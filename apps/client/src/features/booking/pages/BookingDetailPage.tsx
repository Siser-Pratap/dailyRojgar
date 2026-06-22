import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { bookings } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

const bookingSteps = [
  'Select service category',
  'Set date and time',
  'Confirm location',
  'Add notes',
  'Review pricing',
  'Choose payment',
  'Confirm booking',
  'Pay online',
  'Booking confirmed',
]

export default function BookingDetailPage() {
  const booking = bookings[0]
  return (
    <PageShell
      title="Booking flow"
      subtitle="A complete customer booking journey from service selection to confirmation."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SectionCard title="Step-by-step booking">
          <div className="grid gap-4">
            {bookingSteps.map((step, index) => (
              <div key={step} className="flex gap-4 rounded-lg bg-gray-50 p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-950">{step}</p>
                  <p className="text-sm text-gray-500">
                    {index < 6 ? 'Completed in the booking form' : 'Shown after confirmation'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <aside className="grid h-fit gap-6">
          <SectionCard title="Current booking">
            <div className="grid gap-3 text-sm">
              <p className="font-bold text-gray-950">{booking.id}</p>
              <p>
                {booking.category} • {booking.worker}
              </p>
              <p>{booking.date}</p>
              <p>{booking.address}</p>
              <div className="flex items-center justify-between">
                <StatusBadge status={booking.status} />
                <strong>{formatCurrency(booking.amount)}</strong>
              </div>
            </div>
          </SectionCard>
          <Link to={ROUTES.CUSTOMER_PAYMENT} className="btn-primary btn-lg">
            Continue to payment
          </Link>
        </aside>
      </div>
    </PageShell>
  )
}
