import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { RequireAuth } from '@/components/layout'
import { PageSpinner } from '@/components/ui'
import { useHydrateAuth } from '@/hooks/useHydrateAuth'

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const HomePage = lazy(() => import('@/features/landing/pages/HomePage'))
const ServicesPage = lazy(() => import('@/features/landing/pages/ServicesPage'))
const AboutPage = lazy(() => import('@/features/landing/pages/AboutPage'))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'))

const CustomerDashboard = lazy(() => import('@/features/customer/pages/DashboardPage'))
const CustomerSearch = lazy(() => import('@/features/search/pages/SearchPage'))
const CustomerBookings = lazy(() => import('@/features/booking/pages/BookingsPage'))
const CustomerBookingDetail = lazy(() => import('@/features/booking/pages/BookingDetailPage'))
const CustomerChat = lazy(() => import('@/features/chat/pages/ChatPage'))
const CustomerPayment = lazy(() => import('@/features/payment/pages/PaymentPage'))
const CustomerProfile = lazy(() => import('@/features/customer/pages/ProfilePage'))

const WorkerDashboard = lazy(() => import('@/features/worker/pages/DashboardPage'))
const WorkerProfileEdit = lazy(() => import('@/features/worker/pages/ProfileEditPage'))
const WorkerDocuments = lazy(() => import('@/features/worker/pages/DocumentsPage'))
const WorkerJobs = lazy(() => import('@/features/worker/pages/JobsPage'))
const WorkerJobDetail = lazy(() => import('@/features/worker/pages/JobDetailPage'))
const WorkerEarnings = lazy(() => import('@/features/worker/pages/EarningsPage'))
const WorkerAvailability = lazy(() => import('@/features/worker/pages/AvailabilityPage'))
const WorkerChat = lazy(() => import('@/features/chat/pages/ChatPage'))

const AdminDashboard = lazy(() => import('@/features/admin/pages/DashboardPage'))
const AdminUsers = lazy(() => import('@/features/admin/pages/UsersPage'))
const AdminWorkers = lazy(() => import('@/features/admin/pages/WorkersPage'))
const AdminWorkerDetail = lazy(() => import('@/features/admin/pages/WorkerDetailPage'))
const AdminBookings = lazy(() => import('@/features/admin/pages/BookingsPage'))
const AdminPayments = lazy(() => import('@/features/admin/pages/PaymentsPage'))
const AdminReports = lazy(() => import('@/features/admin/pages/ReportsPage'))

const WorkerPublicProfile = lazy(() => import('@/features/worker/pages/PublicProfilePage'))
const NotFoundPage = lazy(() => import('@/features/landing/pages/NotFoundPage'))

// ─── Router definition ────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Public
  { path: ROUTES.HOME, element: <HomePage /> },
  { path: ROUTES.SERVICES, element: <ServicesPage /> },
  { path: ROUTES.ABOUT, element: <AboutPage /> },
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.REGISTER, element: <RegisterPage /> },
  { path: ROUTES.WORKER_PROFILE, element: <WorkerPublicProfile /> },

  // Customer
  {
    path: ROUTES.CUSTOMER_DASHBOARD,
    element: (
      <RequireAuth role="customer">
        <CustomerDashboard />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_SEARCH,
    element: (
      <RequireAuth role="customer">
        <CustomerSearch />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_BOOKINGS,
    element: (
      <RequireAuth role="customer">
        <CustomerBookings />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_BOOKING_DETAIL,
    element: (
      <RequireAuth role="customer">
        <CustomerBookingDetail />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_CHAT,
    element: (
      <RequireAuth role="customer">
        <CustomerChat />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_PAYMENT,
    element: (
      <RequireAuth role="customer">
        <CustomerPayment />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.CUSTOMER_PROFILE,
    element: (
      <RequireAuth role="customer">
        <CustomerProfile />
      </RequireAuth>
    ),
  },

  // Worker
  {
    path: ROUTES.WORKER_DASHBOARD,
    element: (
      <RequireAuth role="worker">
        <WorkerDashboard />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_PROFILE_EDIT,
    element: (
      <RequireAuth role="worker">
        <WorkerProfileEdit />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_DOCUMENTS,
    element: (
      <RequireAuth role="worker">
        <WorkerDocuments />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_JOBS,
    element: (
      <RequireAuth role="worker">
        <WorkerJobs />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_JOB_DETAIL,
    element: (
      <RequireAuth role="worker">
        <WorkerJobDetail />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_EARNINGS,
    element: (
      <RequireAuth role="worker">
        <WorkerEarnings />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_AVAILABILITY,
    element: (
      <RequireAuth role="worker">
        <WorkerAvailability />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.WORKER_CHAT,
    element: (
      <RequireAuth role="worker">
        <WorkerChat />
      </RequireAuth>
    ),
  },

  // Admin
  {
    path: ROUTES.ADMIN_DASHBOARD,
    element: (
      <RequireAuth role="admin">
        <AdminDashboard />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_USERS,
    element: (
      <RequireAuth role="admin">
        <AdminUsers />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_WORKERS,
    element: (
      <RequireAuth role="admin">
        <AdminWorkers />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_WORKER_DETAIL,
    element: (
      <RequireAuth role="admin">
        <AdminWorkerDetail />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_BOOKINGS,
    element: (
      <RequireAuth role="admin">
        <AdminBookings />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_PAYMENTS,
    element: (
      <RequireAuth role="admin">
        <AdminPayments />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.ADMIN_REPORTS,
    element: (
      <RequireAuth role="admin">
        <AdminReports />
      </RequireAuth>
    ),
  },

  // 404
  { path: '*', element: <NotFoundPage /> },
])

export default function AppRouter() {
  const ready = useHydrateAuth()

  if (!ready) {
    return <PageSpinner />
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
