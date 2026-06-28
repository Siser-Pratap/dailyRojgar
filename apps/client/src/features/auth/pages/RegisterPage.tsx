import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/components/layout'
import { Button, Input, Select } from '@/components/ui'
import { zodResolver } from '@/lib/zodResolver'
import { useRegister } from '../hooks'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().trim().min(10, 'Enter a valid phone number').max(15),
  email: z.string().trim().email('Enter a valid email address'),
  role: z.enum(['customer', 'worker']),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

type RegisterForm = z.infer<typeof registerSchema>

const roleOptions = [
  { label: 'I want to hire workers (Customer)', value: 'customer' },
  { label: 'I want to find work (Worker)', value: 'worker' },
]

export default function RegisterPage() {
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' },
  })

  return (
    <PublicLayout>
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <section className="card w-full max-w-2xl p-6">
          <h1 className="text-3xl font-bold text-gray-950">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join dailyRojgar to hire trusted workers or find daily work.
          </p>

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
            noValidate
          >
            <Input
              label="Full name"
              placeholder="Rahul Singh"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Phone"
              placeholder="9876543210"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Select
              label="I am a"
              options={roleOptions}
              error={errors.role?.message}
              {...register('role')}
            />
            <div className="md:col-span-2">
              <Input
                label="Password"
                type="password"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" size="lg" fullWidth isLoading={registerMutation.isPending}>
                Create account
              </Button>
            </div>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-primary-700">
              Login
            </Link>
          </p>
        </section>
      </div>
    </PublicLayout>
  )
}
