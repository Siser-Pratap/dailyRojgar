import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { fetchAdminDisputes, resolveDispute } from '../api'

type AnyRecord = Record<string, unknown>
type DisputeVariables = {
  bookingId: string
  payload: { resolution: 'customer' | 'worker' | 'partial'; refundAmount?: number; notes?: string }
}

export default function AdminReports() {
  const queryClient = useQueryClient()
  const { data, isError } = useQuery({ queryKey: ['admin-disputes'], queryFn: fetchAdminDisputes })
  const mutation = useMutation({
    mutationFn: ({ bookingId, payload }: DisputeVariables) => resolveDispute(bookingId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }),
  })
  const disputes: AnyRecord[] = data?.length
    ? data
    : [
        {
          _id: 'DR-2026-000128',
          bookingNumber: 'DR-2026-000128',
          dispute: { reason: 'Customer raised a delay dispute.', status: 'open' },
          status: 'disputed',
        },
      ]
  const selectedId = String(disputes[0]?._id ?? '')

  return (
    <DashboardShell role="Admin" title="Reports and disputes">
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Open disputes">
          {isError && (
            <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
              Using fallback disputes while API is unavailable.
            </p>
          )}
          <div className="grid gap-3">
            {disputes.map((dispute) => {
              const disputeInfo = dispute.dispute as
                | { reason?: string; status?: string }
                | undefined
              return (
                <div
                  key={String(dispute._id)}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                >
                  <p className="font-semibold text-gray-950">
                    {String(dispute.bookingNumber ?? dispute._id)}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {String(disputeInfo?.reason ?? 'Open dispute')}
                  </p>
                  <StatusBadge status={String(disputeInfo?.status ?? dispute.status)} />
                </div>
              )
            })}
          </div>
        </SectionCard>
        <SectionCard title="Resolution tools">
          <div className="grid gap-2">
            <button
              className="btn-primary btn-md"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  bookingId: selectedId,
                  payload: { resolution: 'customer', notes: 'Resolved for customer by admin' },
                })
              }
            >
              Resolve for customer
            </button>
            <button
              className="btn-outline btn-md"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  bookingId: selectedId,
                  payload: { resolution: 'worker', notes: 'Closed in worker favor' },
                })
              }
            >
              Resolve for worker
            </button>
            <button
              className="btn-outline btn-md"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({
                  bookingId: selectedId,
                  payload: {
                    resolution: 'partial',
                    refundAmount: 250,
                    notes: 'Partial refund approved',
                  },
                })
              }
            >
              Partial refund ₹250
            </button>
            {mutation.isSuccess && (
              <p className="rounded bg-primary-50 p-2 text-sm text-primary-800">
                Dispute resolution submitted.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
