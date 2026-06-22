import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { ROUTES } from '@/constants/routes'
import { PublicNav } from '@/features/phase8/components'
import { login } from '../api'
import { getDashboardRoute } from '../authRedirect'

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? 'Login failed. Please check your credentials.'
  }
  return error instanceof Error ? error.message : 'Login failed. Please try again.'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await login({ email, password })
      setAuth(result.user, result.tokens.accessToken, result.tokens.refreshToken)
      navigate(getDashboardRoute(result.user.role), { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <section className="card w-full max-w-md p-6">
          <span className="badge-green">Welcome back</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-950">Login to dailyRojgar</h1>
          <p className="mt-2 text-sm text-gray-600">Access bookings, jobs, chats, and payments.</p>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input
                className="input mt-2"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Password
              <input
                className="input mt-2"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button className="btn-primary btn-lg" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
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
