import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Select, Textarea, PageSpinner } from '@/components/ui'
import { zodResolver } from '@/lib/zodResolver'
import { useAuth } from '@/hooks/useAuth'
import { AiProfileAssistant } from '@/features/ai/AiProfileAssistant'
import { useUpsertWorkerProfile, useWorkerProfile } from '../hooks'

const SERVICE_CATEGORIES = [
  'Construction',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'House Help',
  'Painting',
  'Repairs',
  'Driving',
  'Gardening',
  'Sanitation',
]

const categoryOptions = SERVICE_CATEGORIES.map((name) => ({ label: name, value: name }))

const profileSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  pricePerDay: z.coerce.number().min(1, 'Enter a daily rate'),
  experienceYears: z.coerce.number().min(0).max(60),
  skills: z.string().trim().min(1, 'Add at least one skill'),
  bio: z.string().trim().max(1000).optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function WorkerProfileEdit() {
  const { user } = useAuth()
  // 404 (no profile yet) is expected for new workers → render a blank create form.
  const { data: profile, isLoading } = useWorkerProfile(user?._id)
  const upsert = useUpsertWorkerProfile(user?._id)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      categoryId: profile?.categoryId ?? '',
      pricePerDay: profile?.pricePerDay ?? 0,
      experienceYears: profile?.experienceYears ?? 0,
      skills: profile?.skills?.join(', ') ?? '',
      bio: profile?.bio ?? '',
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    upsert.mutate({
      categoryId: values.categoryId,
      pricePerDay: values.pricePerDay,
      experienceYears: values.experienceYears,
      skills: values.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: values.bio || undefined,
    })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Worker profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Edit your category, skills, pricing, and public bio.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                placeholder="Select a category"
                options={categoryOptions}
                error={errors.categoryId?.message}
                {...register('categoryId')}
              />
              <Input
                label="Price per day (₹)"
                type="number"
                min={1}
                error={errors.pricePerDay?.message}
                {...register('pricePerDay')}
              />
            </div>
            <Input
              label="Experience (years)"
              type="number"
              min={0}
              error={errors.experienceYears?.message}
              {...register('experienceYears')}
            />
            <Input
              label="Skills (comma separated)"
              placeholder="Wiring, Fan repair, Switch boards"
              error={errors.skills?.message}
              {...register('skills')}
            />
            <Textarea
              label="Bio"
              placeholder="Describe your experience and services"
              error={errors.bio?.message}
              {...register('bio')}
            />
            <Button type="submit" className="w-fit" isLoading={upsert.isPending}>
              Save profile
            </Button>
          </form>
        </Card>

        <AiProfileAssistant
          getValues={() => {
            const v = getValues()
            return {
              categoryId: v.categoryId,
              pricePerDay: Number(v.pricePerDay) || 0,
              skills: (v.skills ?? '')
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
              bio: v.bio,
            }
          }}
          onApplyPrice={(p) => setValue('pricePerDay', p, { shouldDirty: true })}
          onApplyBio={(b) => setValue('bio', b, { shouldDirty: true })}
        />
      </div>
    </DashboardLayout>
  )
}
