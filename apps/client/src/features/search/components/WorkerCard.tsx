import { Link } from 'react-router-dom'
import { ROUTES, buildRoute } from '@/constants/routes'
import { Avatar, Badge, Button, Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import type { SearchWorker } from '../api'

export function WorkerCard({ worker }: { worker: SearchWorker }) {
  const profileHref = buildRoute(ROUTES.WORKER_PROFILE, { id: worker._id })

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={worker.userId.name} src={worker.userId.profileImage} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate font-bold text-gray-950">{worker.userId.name}</h3>
            <Badge variant={worker.isAvailable ? 'green' : 'gray'}>
              {worker.isAvailable ? 'Available' : 'Busy'}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-gray-600">
            {worker.categoryId}
            {worker.distance !== null && ` • ${worker.distance} km away`}
          </p>
        </div>
      </div>

      {worker.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {worker.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">★ {worker.rating.average.toFixed(1)}</span>{' '}
          ({worker.rating.totalReviews})
          <span className="ml-3 font-bold text-gray-950">
            {formatCurrency(worker.pricePerDay)}/day
          </span>
        </div>
        <Link to={profileHref}>
          <Button size="sm">View profile</Button>
        </Link>
      </div>
    </Card>
  )
}
