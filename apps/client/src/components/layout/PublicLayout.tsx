import { Link, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui'

const dashboardByRole = {
  customer: ROUTES.CUSTOMER_DASHBOARD,
  worker: ROUTES.WORKER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
} as const

function Brand() {
  return (
    <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-gray-950">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
        DR
      </span>
      <span>dailyRojgar</span>
    </Link>
  )
}

function PublicNav() {
  const { isAuthenticated, role } = useAuth()
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link to={ROUTES.SERVICES} className="hover:text-primary-700">
            Services
          </Link>
          <Link to={ROUTES.ABOUT} className="hover:text-primary-700">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isAuthenticated && role ? (
            <Link to={dashboardByRole[role]}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-10">
      <div className="container grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3">
            <Brand />
          </div>
          <p className="max-w-md text-sm leading-6 text-gray-600">
            A trusted marketplace connecting households and businesses with verified daily wage
            workers.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-950">Company</h3>
          <div className="grid gap-2 text-sm text-gray-600">
            <Link to={ROUTES.ABOUT}>About</Link>
            <Link to={ROUTES.SERVICES}>Services</Link>
            <Link to={ROUTES.REGISTER}>Join as worker</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-950">Trust</h3>
          <div className="grid gap-2 text-sm text-gray-600">
            <span>Verified profiles</span>
            <span>Secure payments</span>
            <span>Rated service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/** Public marketing/auth shell. Use as a layout route. */
export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicNav />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  )
}
