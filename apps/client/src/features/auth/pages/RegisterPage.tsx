import { FormEvent, useState } from 'react'
import { AxiosError } from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { ROUTES } from '@/constants/routes'
import { PublicNav } from '@/features/phase8/components'
import { register, UserRole } from '../api'
import { getDashboardRoute } from '../authRedirect'

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    return data?.message ?? 'Registration failed. Please review your details.'
  }
  return error instanceof Error ? error.message : 'Registration failed. Please try again.'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await register({ name, phone, email, role, password })
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
        <section className="card w-full max-w-2xl p-6">
          <span className="badge-green">Join dailyRojgar</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-950">Create your account</h1>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold text-gray-700">
              Full name
              <input
                className="input mt-2"
                placeholder="Rahul Singh"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                required
              />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Phone
              <input
                className="input mt-2"
                placeholder="9876543210"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                minLength={10}
                required
              />
            </label>
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
              Role
              <select
                className="input mt-2"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
              >
                <option value="customer">customer</option>
                <option value="worker">worker</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">
              Password
              <input
                className="input mt-2"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {error && (
              <p className="rounded bg-red-50 p-3 text-sm text-red-700 md:col-span-2">{error}</p>
            )}
            <button className="btn-primary btn-lg md:col-span-2" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-primary-700">
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
