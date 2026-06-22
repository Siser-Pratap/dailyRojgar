import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'

const users = ['Amit Sharma', 'Priya Nair', 'Ramesh Kumar', 'Meena Devi']

export default function AdminUsers() {
  return (
    <DashboardShell role="Admin" title="User management">
      <SectionCard title="Users">
        <div className="grid gap-3">
          {users.map((user, index) => (
            <div
              key={user}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">{user}</p>
                <p className="text-sm text-gray-500">{index > 1 ? 'worker' : 'customer'}</p>
              </div>
              <StatusBadge status="completed" />
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
