import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Card, StatusBadge, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { fetchAdminWorkers } from '../api'

const statusFilters = [
  { label: 'Under review', value: 'under_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: '' },
]

export default function AdminWorkers() {
  const [status, setStatus] = useState('under_review')
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-workers', status],
    queryFn: () => fetchAdminWorkers(status || undefined),
  })

  const workers = data ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Worker verification</h1>
        <p className="mt-1 text-sm text-gray-600">Review worker profiles and documents.</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={
              'rounded-full px-3 py-1 text-sm font-medium transition ' +
              (status === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : workers.length === 0 ? (
        <EmptyState icon="🛠️" title="No workers in this queue" />
      ) : (
        <div className="grid gap-3">
          {workers.map((worker) => {
            const user =
              typeof worker.userId === 'string'
                ? { _id: worker.userId, name: worker.userId }
                : worker.userId
            return (
              <Link key={worker._id} to={buildRoute(ROUTES.ADMIN_WORKER_DETAIL, { id: user._id })}>
                <Card className="flex items-center justify-between p-4 transition hover:border-primary-300 hover:bg-primary-50/40">
                  <div>
                    <p className="font-semibold text-gray-950">{user.name}</p>
                    <p className="text-sm text-gray-500">
                      {worker.categoryId} • {worker.skills.join(', ')}
                    </p>
                  </div>
                  <StatusBadge status={worker.verificationStatus} />
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
