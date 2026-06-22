import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardShell, SectionCard, StatCard, StatusBadge } from '@/features/phase8/components'
import { adminMetrics, payments, workerJobs } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  return (
    <DashboardShell role="Admin" title="Metrics overview">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-4">
          {adminMetrics.map((metric) => (
            <StatCard key={metric.label} {...metric} />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Worker verification queue"
            action={
              <Link to={ROUTES.ADMIN_WORKERS} className="btn-outline btn-sm">
                Review all
              </Link>
            }
          >
            <div className="grid gap-3">
              {workerJobs.map((job) => (
                <div
                  key={job.customer}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-950">{job.customer}</p>
                    <p className="text-sm text-gray-500">Documents pending</p>
                  </div>
                  <button className="btn-primary btn-sm">Verify</button>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent disputes">
            <div className="grid gap-3">
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-semibold text-gray-950">DR-2026-000128</p>
                <p className="text-sm text-yellow-700">Customer reported delayed arrival.</p>
              </div>
            </div>
          </SectionCard>
        </div>
        <SectionCard title="Transaction feed">
          <div className="grid gap-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-950">{payment.booking}</p>
                  <p className="text-sm text-gray-500">{payment.method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <strong>{formatCurrency(payment.amount)}</strong>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Weekly growth chart">
          <div className="flex h-56 items-end gap-3 rounded-lg bg-gray-50 p-4">
            {[45, 70, 52, 88, 64, 96, 110].map((height, index) => (
              <div key={index} className="flex-1 rounded-t bg-primary-600" style={{ height }} />
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
