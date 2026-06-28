import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, StatusBadge, SkeletonGrid } from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { fetchAdminDisputes, resolveDispute, type AdminDispute } from '../api'

interface ResolveVars {
  bookingId: string
  payload: { resolution: 'customer' | 'worker' | 'partial'; refundAmount?: number; notes?: string }
}

export default function AdminReports() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [partialAmounts, setPartialAmounts] = useState<Record<string, string>>({})

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: fetchAdminDisputes,
  })

  const mutation = useMutation({
    mutationFn: ({ bookingId, payload }: ResolveVars) => resolveDispute(bookingId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
      toast.success('Dispute resolved')
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not resolve dispute')),
  })

  const disputes = data ?? []

  const resolve = (dispute: AdminDispute, resolution: 'customer' | 'worker' | 'partial') => {
    const refundAmount =
      resolution === 'partial' ? Number(partialAmounts[dispute._id] || 0) : undefined
    if (resolution === 'partial' && (!refundAmount || refundAmount <= 0)) {
      toast.error('Enter a refund amount')
      return
    }
    mutation.mutate({
      bookingId: dispute._id,
      payload: { resolution, refundAmount, notes: `Resolved as ${resolution} by admin` },
    })
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Reports & disputes</h1>
        <p className="mt-1 text-sm text-gray-600">Review and resolve open disputes.</p>
      </div>

      {isLoading ? (
        <SkeletonGrid count={3} />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : disputes.length === 0 ? (
        <EmptyState icon="✅" title="No open disputes" description="All clear right now." />
      ) : (
        <div className="grid gap-4">
          {disputes.map((dispute) => (
            <Card key={dispute._id} className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-950">{dispute.bookingNumber}</p>
                <StatusBadge status={dispute.dispute?.status ?? dispute.status} />
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {dispute.dispute?.reason ?? 'Open dispute'}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  disabled={mutation.isPending}
                  onClick={() => resolve(dispute, 'customer')}
                >
                  For customer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => resolve(dispute, 'worker')}
                >
                  For worker
                </Button>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="₹ amount"
                    className="w-28"
                    value={partialAmounts[dispute._id] ?? ''}
                    onChange={(e) =>
                      setPartialAmounts((prev) => ({ ...prev, [dispute._id]: e.target.value }))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() => resolve(dispute, 'partial')}
                  >
                    Partial refund
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
