import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, StatusBadge, SkeletonGrid } from '@/components/ui'
import { ConfirmDialog, EmptyState, ErrorState } from '@/components/feedback'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { formatCurrency } from '@/lib/utils'
import { fetchAdminPayments, refundPayment, type AdminPayment } from '../api'

export default function AdminPayments() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [refundTarget, setRefundTarget] = useState<AdminPayment | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => fetchAdminPayments(),
  })

  const refund = useMutation({
    mutationFn: (paymentId: string) => refundPayment(paymentId, 'Admin-initiated refund'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      toast.success('Refund initiated')
      setRefundTarget(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Refund failed')),
  })

  const payments = data ?? []

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Transaction log</h1>
        <p className="mt-1 text-sm text-gray-600">Payments, payouts, and refunds.</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" />
      ) : (
        <Card className="divide-y divide-gray-100 p-0">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">
                  {payment.providerPaymentId ?? payment._id}
                </p>
                <p className="text-sm text-gray-500">
                  Worker payout: {formatCurrency(payment.workerPayout)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={payment.status} />
                <span className="font-bold text-gray-950">{formatCurrency(payment.amount)}</span>
                {payment.status === 'captured' && (
                  <Button size="sm" variant="outline" onClick={() => setRefundTarget(payment)}>
                    Refund
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(refundTarget)}
        onClose={() => setRefundTarget(null)}
        title="Issue refund?"
        description={
          refundTarget
            ? `Refund ${formatCurrency(refundTarget.amount)} for this payment? The amount depends on booking status and platform policy.`
            : ''
        }
        confirmLabel="Issue refund"
        danger
        isLoading={refund.isPending}
        onConfirm={() => refundTarget && refund.mutate(refundTarget._id)}
      />
    </DashboardLayout>
  )
}
