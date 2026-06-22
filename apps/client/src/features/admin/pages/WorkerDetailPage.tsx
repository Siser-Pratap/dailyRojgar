import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workers } from '@/features/phase8/mockData'

export default function AdminWorkerDetail() {
  const worker = workers[0]
  return (
    <DashboardShell role="Admin" title="Worker detail">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title={worker.name}>
          <div className="grid gap-3 text-gray-700">
            <p>{worker.category}</p>
            <p>{worker.skills.join(', ')}</p>
            <p>{worker.completedJobs} completed jobs</p>
            <StatusBadge status="pending" />
          </div>
        </SectionCard>
        <SectionCard title="Decision">
          <div className="grid gap-2">
            <button className="btn-primary btn-md">Approve worker</button>
            <button className="btn-outline btn-md">Reject</button>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
