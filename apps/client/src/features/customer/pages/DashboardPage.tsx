import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import {
  DashboardShell,
  SectionCard,
  StatCard,
  StatusBadge,
  WorkerCard,
} from '@/features/phase8/components'
import { bookings, workers } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function CustomerDashboard() {
  return (
    <DashboardShell role="Customer" title="Dashboard">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active bookings" value="1" change="Live" />
          <StatCard label="Upcoming" value="2" />
          <StatCard label="Total spend" value={formatCurrency(2475)} />
          <StatCard label="Pending reviews" value="1" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <SectionCard
            title="Active booking"
            action={
              <Link to={ROUTES.CUSTOMER_BOOKINGS} className="btn-outline btn-sm">
                View all
              </Link>
            }
          >
            <div className="rounded-xl bg-primary-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-950">
                    {bookings[0].category} with {bookings[0].worker}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookings[0].date} • {bookings[0].address}
                  </p>
                </div>
                <StatusBadge status={bookings[0].status} />
              </div>
              <div className="mt-4 flex gap-3">
                <Link to={ROUTES.CUSTOMER_CHAT} className="btn-primary btn-sm">
                  Open chat
                </Link>
                <Link to={ROUTES.CUSTOMER_PAYMENT} className="btn-outline btn-sm">
                  Payment
                </Link>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Quick search">
            <WorkerCard worker={workers[0]} />
          </SectionCard>
        </div>
        <SectionCard title="Recent bookings">
          <div className="grid gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-950">{booking.category}</p>
                  <p className="text-sm text-gray-500">
                    {booking.worker} • {booking.date}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
