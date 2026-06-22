import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardShell, SectionCard, StatCard, StatusBadge } from '@/features/phase8/components'
import { reviews, workerJobs } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function WorkerDashboard() {
  return (
    <DashboardShell role="Worker" title="Dashboard">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Today" value={formatCurrency(1585)} change="+2 jobs" />
          <StatCard label="This week" value={formatCurrency(8420)} />
          <StatCard label="This month" value={formatCurrency(32600)} />
          <StatCard label="Rating" value="4.9★" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <SectionCard
            title="Incoming jobs"
            action={
              <Link to={ROUTES.WORKER_JOBS} className="btn-outline btn-sm">
                All jobs
              </Link>
            }
          >
            <div className="grid gap-3">
              {workerJobs.map((job) => (
                <div key={job.title} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-950">{job.title}</p>
                      <p className="text-sm text-gray-500">
                        {job.customer} • {job.time}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <strong>{formatCurrency(job.amount)}</strong>
                    <div className="flex gap-2">
                      <button className="btn-primary btn-sm">Accept</button>
                      <button className="btn-outline btn-sm">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
          <div className="grid gap-6">
            <SectionCard title="Availability">
              <div className="flex items-center justify-between rounded-xl bg-primary-50 p-4">
                <div>
                  <p className="font-bold text-gray-950">Available now</p>
                  <p className="text-sm text-gray-600">Visible in nearby search</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary-600" />
              </div>
            </SectionCard>
            <SectionCard title="Recent rating">
              <p className="text-3xl font-bold text-yellow-700">4.9★</p>
              <p className="mt-2 text-sm text-gray-600">{reviews[0].text}</p>
            </SectionCard>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
