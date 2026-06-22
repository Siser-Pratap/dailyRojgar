import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { bookings } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function AdminBookings() {
  return (
    <DashboardShell role="Admin" title="All bookings">
      <SectionCard title="Booking ledger">
        <div className="grid gap-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">{booking.id}</p>
                <p className="text-sm text-gray-500">
                  {booking.category} • {booking.worker}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={booking.status} />
                <strong>{formatCurrency(booking.amount)}</strong>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
