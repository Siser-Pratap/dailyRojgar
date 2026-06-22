import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { formatCurrency } from '@/lib/utils'
import { workers } from './mockData'

export function PublicNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 font-bold text-gray-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            DR
          </span>
          <span>dailyRojgar</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link to={ROUTES.SERVICES} className="hover:text-primary-700">
            Services
          </Link>
          <Link to={ROUTES.CUSTOMER_SEARCH} className="hover:text-primary-700">
            Find workers
          </Link>
          <Link to={ROUTES.ABOUT} className="hover:text-primary-700">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.LOGIN} className="btn-outline btn-sm">
            Login
          </Link>
          <Link to={ROUTES.REGISTER} className="btn-primary btn-sm">
            Register
          </Link>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-10">
      <div className="container grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2 font-bold text-gray-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              DR
            </span>
            dailyRojgar
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

export function PageShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title?: string
  subtitle?: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {title && (
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary-700">
              dailyRojgar
            </p>
            <h1 className="text-3xl font-bold text-gray-950 md:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 max-w-2xl text-gray-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white p-6 lg:block">
        <Link to={ROUTES.HOME} className="mb-8 flex items-center gap-2 font-bold text-gray-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            DR
          </span>
          dailyRojgar
        </Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          {role} workspace
        </p>
        <nav className="grid gap-2 text-sm font-medium text-gray-600">
          <Link
            className="rounded px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
            to={
              role === 'Admin'
                ? ROUTES.ADMIN_DASHBOARD
                : role === 'Worker'
                  ? ROUTES.WORKER_DASHBOARD
                  : ROUTES.CUSTOMER_DASHBOARD
            }
          >
            Dashboard
          </Link>
          <Link
            className="rounded px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
            to={role === 'Worker' ? ROUTES.WORKER_JOBS : ROUTES.CUSTOMER_BOOKINGS}
          >
            Bookings
          </Link>
          <Link
            className="rounded px-3 py-2 hover:bg-primary-50 hover:text-primary-700"
            to={role === 'Worker' ? ROUTES.WORKER_PROFILE_EDIT : ROUTES.CUSTOMER_PROFILE}
          >
            Profile
          </Link>
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div>
              <p className="text-sm text-gray-500">{role}</p>
              <h1 className="text-xl font-bold text-gray-950">{title}</h1>
            </div>
            <span className="badge-green">Live</span>
          </div>
        </div>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}

export function StatCard({
  label,
  value,
  change,
}: {
  label: string
  value: string
  change?: string
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-950">{value}</p>
        {change && <span className="badge-green">{change}</span>}
      </div>
    </div>
  )
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-gray-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function WorkerCard({ worker = workers[0] }: { worker?: (typeof workers)[number] }) {
  return (
    <article className="card p-5 transition hover:shadow-card-hover">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-800">
          {worker.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-gray-950">{worker.name}</h3>
            <span className={worker.available ? 'badge-green' : 'badge-gray'}>
              {worker.available ? 'Available' : 'Busy'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {worker.category} • {worker.distance}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {worker.skills.map((skill) => (
              <span key={skill} className="badge-gray">
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="font-semibold text-yellow-700">
              ★ {worker.rating} ({worker.reviews})
            </span>
            <span className="font-bold text-gray-950">{formatCurrency(worker.price)}/day</span>
          </div>
          <Link
            to={buildRoute(ROUTES.WORKER_PROFILE, { id: worker.id })}
            className="btn-primary btn-md mt-4 w-full"
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export function StateShowcase() {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-3 h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-8 animate-pulse rounded bg-gray-100" />
        <p className="mt-3 text-xs font-semibold text-gray-500">Loading skeleton</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <p className="text-2xl">🗂️</p>
        <p className="mt-2 font-semibold text-gray-950">No results yet</p>
        <p className="text-xs">Adjust filters or start a new search.</p>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p className="font-semibold">Unable to load</p>
        <p className="text-xs">Retry button appears here.</p>
      </div>
      <div className="rounded-lg border border-primary-200 bg-primary-50 p-4 text-sm text-primary-800">
        <p className="font-semibold">Success</p>
        <p className="text-xs">Action completed with toast.</p>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'completed' || status === 'captured'
      ? 'badge-green'
      : status === 'pending' || status === 'created'
        ? 'badge-yellow'
        : status === 'cancelled' || status === 'refunded'
          ? 'badge-red'
          : 'badge-gray'
  return <span className={className}>{status.replace('_', ' ')}</span>
}
