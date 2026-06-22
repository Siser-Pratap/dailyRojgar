import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <section className="card max-w-md p-8 text-center">
        <p className="text-6xl">🧭</p>
        <h1 className="mt-4 text-3xl font-bold text-gray-950">Page not found</h1>
        <p className="mt-2 text-gray-600">The page may have moved or the route is unavailable.</p>
        <Link to={ROUTES.HOME} className="btn-primary btn-lg mt-6">
          Go home
        </Link>
      </section>
    </div>
  )
}
