import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workerJobs } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function WorkerJobDetail() {
  const job = workerJobs[0]
  return (
    <PageShell
      title={job.title}
      subtitle="Worker job detail with customer, route, status actions, and chat."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title="Job information">
          <div className="grid gap-3 text-gray-700">
            <p>
              <strong>Customer:</strong> {job.customer}
            </p>
            <p>
              <strong>Time:</strong> {job.time}
            </p>
            <p>
              <strong>Address:</strong> Sector 22, Noida
            </p>
            <p>
              <strong>Amount:</strong> {formatCurrency(job.amount)}
            </p>
            <StatusBadge status={job.status} />
          </div>
        </SectionCard>
        <SectionCard title="Actions">
          <div className="grid gap-2">
            <button className="btn-primary btn-md">Accept job</button>
            <button className="btn-outline btn-md">Start work</button>
            <button className="btn-outline btn-md">Mark complete</button>
            <Link to={ROUTES.WORKER_CHAT} className="btn-secondary btn-md">
              Open chat
            </Link>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}
