import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { bookings, payments } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function PaymentPage() {
  const booking = bookings[0]
  return (
    <PageShell
      title="Secure payment"
      subtitle="Razorpay checkout handoff with transparent job pricing breakdown."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SectionCard title="Choose payment method">
          <div className="grid gap-4 md:grid-cols-2">
            <button className="rounded-xl border-2 border-primary-600 bg-primary-50 p-5 text-left">
              <p className="font-bold text-gray-950">Online payment</p>
              <p className="mt-1 text-sm text-gray-600">
                Pay with UPI, cards, netbanking via Razorpay.
              </p>
            </button>
            <button className="rounded-xl border border-gray-200 bg-white p-5 text-left">
              <p className="font-bold text-gray-950">Cash after work</p>
              <p className="mt-1 text-sm text-gray-600">Record cash payment after completion.</p>
            </button>
          </div>
          <button className="btn-primary btn-lg mt-6">Open Razorpay checkout</button>
        </SectionCard>
        <SectionCard title="Pricing summary">
          <div className="grid gap-3 text-sm">
            <Row label="Worker charges" value={formatCurrency(850)} />
            <Row label="Platform fee" value={formatCurrency(85)} />
            <div className="border-t border-gray-200 pt-3">
              <Row label="Total" value={formatCurrency(booking.amount)} strong />
            </div>
            <StatusBadge status={payments[0].status} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={strong ? 'text-lg font-bold text-gray-950' : 'font-semibold text-gray-950'}>
        {value}
      </span>
    </div>
  )
}
