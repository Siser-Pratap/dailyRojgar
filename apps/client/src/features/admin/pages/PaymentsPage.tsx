import { useQuery } from '@tanstack/react-query'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { payments as fallbackPayments } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'
import { fetchAdminPayments } from '../api'

type AnyRecord = Record<string, unknown>

export default function AdminPayments() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => fetchAdminPayments(),
  })
  const payments: AnyRecord[] = data?.length ? data : (fallbackPayments as unknown as AnyRecord[])

  return (
    <DashboardShell role="Admin" title="Transaction log">
      <SectionCard title="Payments">
        {isError && (
          <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
            Using fallback payments while API is unavailable.
          </p>
        )}
        {isLoading && <div className="mb-3 h-12 animate-pulse rounded bg-gray-100" />}
        <div className="grid gap-3">
          {payments.map((payment) => {
            const id = String(payment._id ?? payment.id)
            const amount = Number(payment.amount ?? 0)
            return (
              <div
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-950">
                    {String(payment.providerPaymentId ?? payment.id)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Worker payout: {formatCurrency(Number(payment.workerPayout ?? 0))}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={String(payment.status ?? 'created')} />
                  <strong>{formatCurrency(amount)}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </DashboardShell>
  )
}
