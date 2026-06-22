import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'

export default function AdminReports() {
  return (
    <DashboardShell role="Admin" title="Reports and disputes">
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Open disputes">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="font-semibold text-gray-950">DR-2026-000128</p>
            <p className="text-sm text-yellow-700">Customer raised a delay dispute.</p>
            <StatusBadge status="pending" />
          </div>
        </SectionCard>
        <SectionCard title="Resolution tools">
          <div className="grid gap-2">
            <button className="btn-primary btn-md">Resolve in customer favor</button>
            <button className="btn-outline btn-md">Reject dispute</button>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
