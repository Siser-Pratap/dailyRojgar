import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicNav } from '@/features/phase8/components'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNav />
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <section className="card w-full max-w-2xl p-6">
          <span className="badge-green">Join dailyRojgar</span>
          <h1 className="mt-4 text-3xl font-bold text-gray-950">Create your account</h1>
          <form className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700">
              Full name
              <input className="input mt-2" placeholder="Rahul Singh" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Phone
              <input className="input mt-2" placeholder="9876543210" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Email
              <input className="input mt-2" type="email" placeholder="you@example.com" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Role
              <select className="input mt-2">
                <option>customer</option>
                <option>worker</option>
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">
              Password
              <input className="input mt-2" type="password" placeholder="Minimum 8 characters" />
            </label>
            <button className="btn-primary btn-lg md:col-span-2" type="button">
              Register
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
