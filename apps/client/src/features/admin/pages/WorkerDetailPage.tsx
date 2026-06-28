import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Avatar, Button, Card, StatusBadge, PageSpinner } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { fetchAdminWorkerDetail, reviewWorkerDocument, updateWorkerVerification } from '../api'

export default function AdminWorkerDetail() {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-worker', id],
    queryFn: () => fetchAdminWorkerDetail(id),
    enabled: Boolean(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-worker', id] })
    queryClient.invalidateQueries({ queryKey: ['admin-workers'] })
  }

  const verification = useMutation({
    mutationFn: (payload: { status: 'approved' | 'rejected'; rejectionReason?: string }) =>
      updateWorkerVerification(id, payload),
    onSuccess: (_d, vars) => {
      invalidate()
      toast.success(vars.status === 'approved' ? 'Worker approved' : 'Worker rejected')
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Decision failed')),
  })

  const docReview = useMutation({
    mutationFn: (vars: { documentId: string; status: 'approved' | 'rejected' }) =>
      reviewWorkerDocument(id, vars.documentId, { status: vars.status }),
    onSuccess: () => {
      invalidate()
      toast.success('Document updated')
    },
    onError: (e) => toast.error(getApiErrorMessage(e, 'Could not update document')),
  })

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !data) {
    return (
      <DashboardLayout>
        <ErrorState title="Worker not found" onRetry={() => refetch()} />
      </DashboardLayout>
    )
  }

  const { profile } = data
  const user = typeof profile.userId === 'string' ? { name: profile.userId } : profile.userId
  const busy = verification.isPending || docReview.isPending

  return (
    <DashboardLayout>
      <Link to={ROUTES.ADMIN_WORKERS} className="text-sm text-primary-700">
        ← Back to workers
      </Link>

      <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="md" />
                <div>
                  <h1 className="text-xl font-bold text-gray-950">{user.name}</h1>
                  <p className="text-sm text-gray-500">
                    {profile.categoryId} • {profile.skills.join(', ')}
                  </p>
                </div>
              </div>
              <StatusBadge status={profile.verificationStatus} />
            </div>
            {profile.rejectionReason && (
              <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
                Rejection reason: {profile.rejectionReason}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-bold text-gray-950">Documents</h2>
            {profile.documents.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            ) : (
              <div className="grid gap-3">
                {profile.documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div>
                      <p className="font-semibold capitalize text-gray-950">{doc.type}</p>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary-700"
                      >
                        View document
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={doc.status} />
                      {doc.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              docReview.mutate({ documentId: doc._id, status: 'approved' })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              docReview.mutate({ documentId: doc._id, status: 'rejected' })
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="h-fit p-6">
          <h2 className="mb-3 text-lg font-bold text-gray-950">Verification decision</h2>
          <div className="grid gap-2">
            <Button disabled={busy} onClick={() => verification.mutate({ status: 'approved' })}>
              Approve worker
            </Button>
            <Button
              variant="danger"
              disabled={busy}
              onClick={() =>
                verification.mutate({
                  status: 'rejected',
                  rejectionReason: 'Documents could not be verified',
                })
              }
            >
              Reject worker
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
