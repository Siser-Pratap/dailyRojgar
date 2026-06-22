import { PageShell, SectionCard, StatCard } from '@/features/phase8/components'
import { formatCurrency } from '@/lib/utils'

export default function WorkerEarnings() {
  return (
    <PageShell
      title="Earnings"
      subtitle="Track daily, weekly, monthly earnings and payout readiness."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Today" value={formatCurrency(1585)} />
        <StatCard label="This week" value={formatCurrency(8420)} />
        <StatCard label="This month" value={formatCurrency(32600)} />
      </div>
      <div className="mt-6">
        <SectionCard title="Payout summary">
          <div className="h-48 rounded-lg bg-primary-50 p-5 text-primary-800">
            Weekly earnings chart placeholder
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}
