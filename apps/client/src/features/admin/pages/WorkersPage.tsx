import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workers as fallbackWorkers } from '@/features/phase8/mockData'
import { fetchAdminWorkers } from '../api'

export default function AdminWorkers() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-workers', 'under_review'],
    queryFn: () => fetchAdminWorkers('under_review'),
  })
  const workers = data?.length
    ? data
    : fallbackWorkers.map((worker) => ({
        _id: worker.id,
        userId: { _id: worker.id, name: worker.name },
        categoryId: worker.category,
        skills: worker.skills,
        verificationStatus: worker.available ? 'approved' : 'under_review',
        documents: [],
      }))

  return (
    <DashboardShell role="Admin" title="Worker verification">
      <SectionCard title="Verification queue">
        {isError && (
          <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
            Using fallback workers while API is unavailable.
          </p>
        )}
        {isLoading && <div className="mb-3 h-12 animate-pulse rounded bg-gray-100" />}
        <div className="grid gap-3">
          {workers.map((worker) => {
            const user =
              typeof worker.userId === 'string'
                ? { _id: worker.userId, name: worker.userId }
                : worker.userId
            return (
              <Link
                key={worker._id}
                to={buildRoute(ROUTES.ADMIN_WORKER_DETAIL, { id: user._id })}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-primary-50"
              >
                <div>
                  <p className="font-semibold text-gray-950">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {worker.categoryId} • {worker.skills.join(', ')}
                  </p>
                </div>
                <StatusBadge status={worker.verificationStatus} />
              </Link>
            )
          })}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
