import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workers } from '@/features/phase8/mockData'

export default function AdminWorkers() {
  return (
    <DashboardShell role="Admin" title="Worker verification">
      <SectionCard title="Verification queue">
        <div className="grid gap-3">
          {workers.map((worker) => (
            <Link
              key={worker.id}
              to={buildRoute(ROUTES.ADMIN_WORKER_DETAIL, { id: worker.id })}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-primary-50"
            >
              <div>
                <p className="font-semibold text-gray-950">{worker.name}</p>
                <p className="text-sm text-gray-500">
                  {worker.category} • {worker.skills.join(', ')}
                </p>
              </div>
              <StatusBadge status={worker.available ? 'completed' : 'pending'} />
            </Link>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
