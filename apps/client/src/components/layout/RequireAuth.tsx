import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/features/auth/api'

const dashboardByRole: Record<UserRole, string> = {
  customer: ROUTES.CUSTOMER_DASHBOARD,
  worker: ROUTES.WORKER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
}

/**
 * Route guard. Use as a layout route (renders <Outlet />) or wrap children.
 * `role` may be a single role or a list of allowed roles.
 */
export function RequireAuth({
  role,
  children,
}: {
  role?: UserRole | UserRole[]
  children?: React.ReactNode
}) {
  const { isAuthenticated, role: userRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />
  }

  if (role && userRole) {
    const allowed = Array.isArray(role) ? role : [role]
    if (!allowed.includes(userRole)) {
      return <Navigate to={dashboardByRole[userRole]} replace />
    }
  }

  return <>{children ?? <Outlet />}</>
}
