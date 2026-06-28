import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Badge, Button, Card, PageSpinner } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { useUpdateAvailability, useWorkerProfile } from '../hooks'

const verificationVariant = {
  approved: 'green',
  under_review: 'yellow',
  draft: 'gray',
  rejected: 'red',
} as const

export default function WorkerAvailability() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError } = useWorkerProfile(user?._id)
  const availability = useUpdateAvailability(user?._id)

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !profile) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="🧰"
          title="Complete your profile first"
          description="Set up your worker profile before managing availability."
          action={
            <Link to={ROUTES.WORKER_PROFILE_EDIT}>
              <Button>Complete profile</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Availability</h1>
        <p className="mt-1 text-sm text-gray-600">
          Control when customers can discover and book you.
        </p>
      </div>

      <Card className="max-w-xl p-6">
        <div className="flex items-center justify-between rounded-xl bg-primary-50 p-5">
          <div>
            <p className="font-bold text-gray-950">Accept nearby jobs</p>
            <p className="text-sm text-gray-600">Toggle off when you are busy or unavailable.</p>
          </div>
          <input
            type="checkbox"
            className="h-6 w-6 accent-primary-600"
            checked={profile.isAvailable}
            disabled={availability.isPending}
            onChange={(e) => availability.mutate(e.target.checked)}
          />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
          <div>
            <p className="font-medium text-gray-900">Verification status</p>
            <p className="text-sm text-gray-500">
              Workers must be approved to appear in customer search.
            </p>
          </div>
          <Badge variant={verificationVariant[profile.verificationStatus]}>
            {profile.verificationStatus.replace(/_/g, ' ')}
          </Badge>
        </div>
      </Card>
    </DashboardLayout>
  )
}
