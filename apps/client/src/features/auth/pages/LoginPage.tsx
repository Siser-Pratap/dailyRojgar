import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicNav } from '@/features/phase8/components'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <section className="card w-full max-w-md p-6">
          <span className="badge-green">Welcome back</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-950">Login to dailyRojgar</h1>
          <p className="mt-2 text-sm text-gray-600">Access bookings, jobs, chats, and payments.</p>
          <form className="mt-6 grid gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input className="input mt-2" type="email" placeholder="you@example.com" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Password
              <input className="input mt-2" type="password" placeholder="••••••••" />
            </label>
            <button className="btn-primary btn-lg" type="button">
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            New here?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-primary-700">
              Create account
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
