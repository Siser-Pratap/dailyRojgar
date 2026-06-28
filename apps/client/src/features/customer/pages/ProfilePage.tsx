import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, PageSpinner } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { zodResolver } from '@/lib/zodResolver'
import { getProfile } from '@/features/auth/api'
import { useUpdateProfile } from '@/features/auth/hooks'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().trim().min(10, 'Enter a valid phone number').max(15),
  street: z.string().trim().max(200).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  pincode: z.string().trim().max(10).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function CustomerProfile() {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      street: user?.address?.street ?? '',
      city: user?.address?.city ?? '',
      state: user?.address?.state ?? '',
      pincode: user?.address?.pincode ?? '',
    },
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !user) {
    return (
      <DashboardLayout>
        <ErrorState title="Could not load profile" onRetry={() => refetch()} />
      </DashboardLayout>
    )
  }

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate({
      name: values.name,
      phone: values.phone,
      address: {
        street: values.street || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        pincode: values.pincode || undefined,
      },
    })
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Profile settings</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your contact details and saved address.</p>
      </div>

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Input label="Email" value={user.email} disabled hint="Email cannot be changed" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" error={errors.name?.message} {...register('name')} />
            <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
          </div>

          <h2 className="mt-2 text-sm font-semibold text-gray-700">Saved address</h2>
          <Input label="Street / area" error={errors.street?.message} {...register('street')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="State" error={errors.state?.message} {...register('state')} />
            <Input label="Pincode" error={errors.pincode?.message} {...register('pincode')} />
          </div>

          <Button type="submit" className="w-fit" isLoading={updateProfile.isPending}>
            Save changes
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  )
}
