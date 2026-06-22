import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { reviews, workers } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function WorkerPublicProfile() {
  const worker = workers[0]
  return (
    <PageShell
      title={worker.name}
      subtitle="Verified worker profile with ratings, skills, stats, and booking CTA."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <section className="card p-6">
            <div className="flex flex-wrap items-start gap-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-100 text-3xl font-bold text-primary-800">
                RK
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-950">{worker.name}</h2>
                  <StatusBadge status="available" />
                </div>
                <p className="mt-1 text-gray-600">
                  {worker.category} specialist • {worker.distance} away
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Metric label="Completed jobs" value={String(worker.completedJobs)} />
                  <Metric label="Experience" value={worker.experience} />
                  <Metric label="Response rate" value={worker.responseRate} />
                </div>
              </div>
            </div>
          </section>
          <SectionCard title="Verified skills">
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span className="badge-green" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Customer reviews">
            <div className="grid gap-3">
              {reviews.map((review) => (
                <div key={review.name} className="rounded-lg bg-gray-50 p-4">
                  <p className="font-semibold text-yellow-700">{'★'.repeat(review.rating)}</p>
                  <p className="mt-1 text-gray-700">“{review.text}”</p>
                  <p className="mt-2 text-sm text-gray-500">— {review.name}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
        <aside className="card h-fit p-6 lg:sticky lg:top-24">
          <p className="text-sm text-gray-500">Starting from</p>
          <p className="text-3xl font-bold text-gray-950">
            {formatCurrency(worker.price)}
            <span className="text-sm font-medium text-gray-500">/day</span>
          </p>
          <div className="mt-5 grid gap-3">
            <input className="input" type="date" />
            <input className="input" type="time" />
            <textarea className="input min-h-24" placeholder="Describe your work" />
          </div>
          <Link to={ROUTES.CUSTOMER_BOOKINGS} className="btn-primary btn-lg mt-5 w-full">
            Book now
          </Link>
        </aside>
      </div>
    </PageShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-gray-950">{value}</p>
    </div>
  )
}
