import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { DashboardShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { workers } from '@/features/phase8/mockData'
import { fetchAdminWorkerDetail, updateWorkerVerification } from '../api'

type WorkerDecisionVariables = {
  workerId: string
  payload: { status: 'approved' | 'rejected'; rejectionReason?: string }
}

export default function AdminWorkerDetail() {
  const { id = workers[0].id } = useParams()
  const queryClient = useQueryClient()
  const { data, isError } = useQuery({
    queryKey: ['admin-worker', id],
    queryFn: () => fetchAdminWorkerDetail(id),
  })
  const decision = useMutation({
    mutationFn: ({ workerId, payload }: WorkerDecisionVariables) =>
      updateWorkerVerification(workerId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-worker', id] }),
  })

  const fallback = workers[0]
  const profile = data?.profile
  const user =
    profile && typeof profile.userId !== 'string'
      ? profile.userId
      : { _id: id, name: fallback.name }
  const documents = profile?.documents ?? [
    { _id: 'aadhaar', type: 'aadhaar', url: '#', status: 'pending' },
    { _id: 'photo', type: 'photo', url: '#', status: 'pending' },
  ]

  return (
    <DashboardShell role="Admin" title="Worker detail">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <SectionCard title={user.name}>
          {isError && (
            <p className="mb-3 rounded bg-yellow-50 p-3 text-sm text-yellow-700">
              Using fallback worker while API is unavailable.
            </p>
          )}
          <div className="grid gap-3 text-gray-700">
            <p>{profile?.categoryId ?? fallback.category}</p>
            <p>{(profile?.skills ?? fallback.skills).join(', ')}</p>
            <p>{fallback.completedJobs} completed jobs</p>
            <StatusBadge status={profile?.verificationStatus ?? 'under_review'} />
          </div>
          <div className="mt-5 grid gap-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div>
                  <p className="font-semibold text-gray-950">{doc.type}</p>
                  <a href={doc.url} className="text-sm text-primary-700">
                    View document
                  </a>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Decision">
          <div className="grid gap-2">
            <button
              className="btn-primary btn-md"
              disabled={decision.isPending}
              onClick={() => decision.mutate({ workerId: id, payload: { status: 'approved' } })}
            >
              Approve worker
            </button>
            <button
              className="btn-outline btn-md"
              disabled={decision.isPending}
              onClick={() =>
                decision.mutate({
                  workerId: id,
                  payload: {
                    status: 'rejected',
                    rejectionReason: 'Documents could not be verified',
                  },
                })
              }
            >
              Reject
            </button>
            {decision.isSuccess && (
              <p className="rounded bg-primary-50 p-2 text-sm text-primary-800">Decision saved.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  )
}
