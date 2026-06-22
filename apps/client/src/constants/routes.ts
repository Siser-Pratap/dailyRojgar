export const ROUTES = {
  // Public
  HOME: '/',
  SERVICES: '/services',
  ABOUT: '/about',
  LOGIN: '/login',
  REGISTER: '/register',
  WORKER_PROFILE: '/workers/:id',

  // Customer (authenticated)
  CUSTOMER_DASHBOARD: '/customer/dashboard',
  CUSTOMER_SEARCH: '/customer/search',
  CUSTOMER_BOOKINGS: '/customer/bookings',
  CUSTOMER_BOOKING_DETAIL: '/customer/bookings/:id',
  CUSTOMER_CHAT: '/customer/chat/:bookingId',
  CUSTOMER_PAYMENT: '/customer/payment/:bookingId',
  CUSTOMER_PROFILE: '/customer/profile',
  CUSTOMER_REVIEWS: '/customer/reviews',

  // Worker (authenticated)
  WORKER_DASHBOARD: '/worker/dashboard',
  WORKER_PROFILE_EDIT: '/worker/profile',
  WORKER_DOCUMENTS: '/worker/documents',
  WORKER_JOBS: '/worker/jobs',
  WORKER_JOB_DETAIL: '/worker/jobs/:id',
  WORKER_EARNINGS: '/worker/earnings',
  WORKER_AVAILABILITY: '/worker/availability',
  WORKER_CHAT: '/worker/chat/:bookingId',

  // Admin (authenticated)
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_WORKERS: '/admin/workers',
  ADMIN_WORKER_DETAIL: '/admin/workers/:id',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_REPORTS: '/admin/reports',
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]

/** Builds a route path with params replaced */
export function buildRoute(route: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    route,
  )
}
