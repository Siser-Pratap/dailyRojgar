import { ROUTES } from '@/constants/routes'
import type { UserRole } from './api'

export function getDashboardRoute(role: UserRole) {
  if (role === 'worker') return ROUTES.WORKER_DASHBOARD
  if (role === 'admin') return ROUTES.ADMIN_DASHBOARD
  return ROUTES.CUSTOMER_DASHBOARD
}
