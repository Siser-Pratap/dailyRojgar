import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import { Avatar, Badge, Card, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { fetchAdminUsers } from '../api'

export default function AdminUsers() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  })

  const users = data ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">User management</h1>
        <p className="mt-1 text-sm text-gray-600">All registered customers, workers, and admins.</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <Card className="divide-y divide-gray-100 p-0">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="sm" />
                <div>
                  <p className="font-semibold text-gray-950">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.email} • {user.phone}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="gray">{user.role}</Badge>
                <Badge variant={user.isActive ? 'green' : 'red'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      )}
    </DashboardLayout>
  )
}
