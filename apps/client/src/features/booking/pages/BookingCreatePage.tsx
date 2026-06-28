import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Avatar, Card, PageSpinner } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { useWorkerProfile } from '@/features/worker/hooks'
import { BookingForm, type BookingWorkerInfo } from '../components/BookingForm'

interface BookWorkerState {
  bookWorker?: { id: string; name: string; categoryId: string; pricePerDay: number }
}

export default function BookingCreatePage() {
  const { workerId } = useParams<{ workerId: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const prefill = (location.state as BookWorkerState | null)?.bookWorker
  // Fetch the profile when navigated directly / refreshed (no router state).
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useWorkerProfile(prefill ? undefined : workerId)

  const worker: BookingWorkerInfo | null = prefill
    ? prefill
    : profile
      ? {
          id: profile.userId._id,
          name: profile.userId.name,
          categoryId: profile.categoryId,
          pricePerDay: profile.pricePerDay,
        }
      : null

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">New booking</h1>
        <p className="mt-1 text-sm text-gray-600">
          Choose a date, location, and describe the work.
        </p>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : isError || !worker ? (
        <ErrorState
          title="Worker unavailable"
          description="We couldn't load this worker. Please go back and try again."
          onRetry={() => refetch()}
        />
      ) : (
        <div className="grid max-w-2xl gap-6">
          <Card className="flex items-center gap-3 p-4">
            <Avatar name={worker.name} size="md" />
            <div>
              <p className="font-semibold text-gray-950">{worker.name}</p>
              <p className="text-sm text-gray-500">{worker.categoryId}</p>
            </div>
          </Card>
          <Card className="p-6">
            <BookingForm
              worker={worker}
              onCreated={(booking) =>
                navigate(buildRoute(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking._id }))
              }
            />
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
