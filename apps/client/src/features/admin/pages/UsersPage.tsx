import { useQuery } from '@tanstack/react-query'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { fetchAdminUsers } from '../api'

const fallbackUsers = ['Amit Sharma', 'Priya Nair', 'Ramesh Kumar', 'Meena Devi']

export default function AdminUsers() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAdminUsers,
  })
  const users = data?.length
    ? data
    : fallbackUsers.map((name, index) => ({
        _id: name,
        name,
        role: index > 1 ? 'worker' : 'customer',
        isActive: true,
      }))

  return (
    <DashboardShell role="Admin" title="User management">
      <SectionCard title="Users">
        {isError && (
          <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
            Using fallback users while API is unavailable.
          </p>
        )}
        {isLoading && <div className="mb-3 h-12 animate-pulse rounded bg-gray-100" />}
        <div className="grid gap-3">
          {users.map((user) => (
            <div
              key={String(user._id ?? user.name)}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">{String(user.name ?? 'Unknown user')}</p>
                <p className="text-sm text-gray-500">{String(user.role ?? 'customer')}</p>
              </div>
              <StatusBadge status={user.isActive === false ? 'cancelled' : 'completed'} />
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
