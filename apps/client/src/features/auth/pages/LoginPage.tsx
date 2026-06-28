import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { zodResolver } from '@/lib/zodResolver'
import { useLogin } from '../hooks'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from
  const loginMutation = useLogin(redirectTo)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  return (
    <PublicLayout>
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <section className="card w-full max-w-md p-6">
          <h1 className="text-3xl font-bold text-gray-950">Login to dailyRojgar</h1>
          <p className="mt-2 text-sm text-gray-600">Access bookings, jobs, chats, and payments.</p>

          <form
            className="mt-6 grid gap-4"
            onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
            noValidate
          >
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" size="lg" fullWidth isLoading={loginMutation.isPending}>
              Login
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            New here?{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-primary-700">
              Create account
            </Link>
          </p>
        </section>
      </div>
    </PublicLayout>
  )
}
