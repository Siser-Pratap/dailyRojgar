import { Link, NavLink, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useUIStore } from '@/app/store'
import { useLogout } from '@/features/auth/hooks'
import { Avatar, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/features/auth/api'

interface NavItem {
  label: string
  to: string
}

const navByRole: Record<UserRole, NavItem[]> = {
  customer: [
    { label: 'Dashboard', to: ROUTES.CUSTOMER_DASHBOARD },
    { label: 'Find workers', to: ROUTES.CUSTOMER_SEARCH },
    { label: 'My bookings', to: ROUTES.CUSTOMER_BOOKINGS },
    { label: 'Profile', to: ROUTES.CUSTOMER_PROFILE },
  ],
  worker: [
    { label: 'Dashboard', to: ROUTES.WORKER_DASHBOARD },
    { label: 'Jobs', to: ROUTES.WORKER_JOBS },
    { label: 'Earnings', to: ROUTES.WORKER_EARNINGS },
    { label: 'Availability', to: ROUTES.WORKER_AVAILABILITY },
    { label: 'Documents', to: ROUTES.WORKER_DOCUMENTS },
    { label: 'Profile', to: ROUTES.WORKER_PROFILE_EDIT },
  ],
  admin: [
    { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD },
    { label: 'Users', to: ROUTES.ADMIN_USERS },
    { label: 'Workers', to: ROUTES.ADMIN_WORKERS },
    { label: 'Bookings', to: ROUTES.ADMIN_BOOKINGS },
    { label: 'Payments', to: ROUTES.ADMIN_PAYMENTS },
    { label: 'Reports', to: ROUTES.ADMIN_REPORTS },
  ],
}

const roleLabel: Record<UserRole, string> = {
  customer: 'Customer',
  worker: 'Worker',
  admin: 'Admin',
}

/** Authenticated dashboard shell with role-aware sidebar. Use as a layout route. */
export function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const { user, role } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const logoutMutation = useLogout()

  if (!user || !role) return null

  const items = navByRole[role]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 -translate-x-full border-r border-gray-200 bg-white p-6 transition-transform lg:translate-x-0',
          sidebarOpen && 'translate-x-0',
        )}
      >
        <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2 font-bold text-gray-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            DR
          </span>
          dailyRojgar
        </Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {roleLabel[role]} workspace
        </p>
        <nav className="grid gap-1 text-sm font-medium">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded px-3 py-2 transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <button
              className="rounded p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="flex flex-1 items-center justify-end gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-950">{user.name}</p>
                <p className="text-xs text-gray-500">{roleLabel[role]}</p>
              </div>
              <Avatar name={user.name} src={user.profileImage} size="sm" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                isLoading={logoutMutation.isPending}
              >
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  )
}
