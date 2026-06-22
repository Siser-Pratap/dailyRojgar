import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { PageShell, SectionCard, StateShowcase, StatusBadge } from '@/features/phase8/components'
import { bookings } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function BookingsPage() {
  return (
    <PageShell title="My bookings" subtitle="Track active, upcoming, and past jobs from one place.">
      <SectionCard
        title="Booking timeline"
        action={
          <Link to={ROUTES.CUSTOMER_SEARCH} className="btn-primary btn-sm">
            New booking
          </Link>
        }
      >
        <div className="grid gap-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              to={buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking.id })}
              className="rounded-lg border border-gray-200 p-4 transition hover:bg-primary-50"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-950">
                    {booking.category} with {booking.worker}
                  </p>
                  <p className="text-sm text-gray-500">
                    {booking.id} • {booking.date} • {booking.address}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  <span className="font-bold text-gray-950">{formatCurrency(booking.amount)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
      <div className="mt-6">
        <StateShowcase />
      </div>
    </PageShell>
  )
}
