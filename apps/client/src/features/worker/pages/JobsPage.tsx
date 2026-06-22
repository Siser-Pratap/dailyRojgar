import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workerJobs } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function WorkerJobs() {
  return (
    <PageShell title="Jobs" subtitle="Incoming requests, active work, and job history.">
      <SectionCard title="All jobs">
        <div className="grid gap-3">
          {workerJobs.map((job) => (
            <div
              key={job.title}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-bold text-gray-950">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.customer} • {job.time}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={job.status} />
                <strong>{formatCurrency(job.amount)}</strong>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  )
}
