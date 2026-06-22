import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { payments } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function AdminPayments() {
  return (
    <DashboardShell role="Admin" title="Transaction log">
      <SectionCard title="Payments">
        <div className="grid gap-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">{payment.id}</p>
                <p className="text-sm text-gray-500">
                  {payment.booking} • {payment.method}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={payment.status} />
                <strong>{formatCurrency(payment.amount)}</strong>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
