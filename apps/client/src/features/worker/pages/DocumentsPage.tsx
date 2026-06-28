import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Select, StatusBadge, PageSpinner } from '@/components/ui'
import { EmptyState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import { useAddWorkerDocument, useWorkerProfile } from '../hooks'
import type { WorkerDocumentType } from '../api'

const docTypeOptions = [
  { label: 'Aadhaar card', value: 'aadhaar' },
  { label: 'Profile photo', value: 'photo' },
  { label: 'Skill certificate', value: 'certificate' },
  { label: 'Other', value: 'other' },
]

const docTypeLabel: Record<WorkerDocumentType, string> = {
  aadhaar: 'Aadhaar card',
  photo: 'Profile photo',
  certificate: 'Skill certificate',
  other: 'Other',
}

export default function WorkerDocuments() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError } = useWorkerProfile(user?._id)
  const addDocument = useAddWorkerDocument(user?._id)

  const [type, setType] = useState<WorkerDocumentType>('aadhaar')
  const [url, setUrl] = useState('')

  if (isLoading) {
    return (
      <DashboardLayout>
        <PageSpinner />
      </DashboardLayout>
    )
  }

  if (isError || !profile) {
    return (
      <DashboardLayout>
        <EmptyState
          icon="🧰"
          title="Complete your profile first"
          description="Set up your worker profile before uploading documents."
          action={
            <Link to={ROUTES.WORKER_PROFILE_EDIT}>
              <Button>Complete profile</Button>
            </Link>
          }
        />
      </DashboardLayout>
    )
  }

  const documents = profile.documents ?? []

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    addDocument.mutate({ type, url: url.trim() }, { onSuccess: () => setUrl('') })
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950">Documents</h1>
        <p className="mt-1 text-sm text-gray-600">
          Upload verification documents. An admin reviews them before you go live.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-950">Your documents</h2>
          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">No documents uploaded yet.</p>
          ) : (
            <div className="grid gap-3">
              {documents.map((doc, i) => (
                <div
                  key={`${doc.type}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-950">{docTypeLabel[doc.type]}</p>
                    <p className="text-xs text-gray-500">Uploaded {formatDate(doc.uploadedAt)}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="h-fit p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-950">Upload document</h2>
          <form onSubmit={handleAdd} className="grid gap-4">
            <Select
              label="Document type"
              options={docTypeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as WorkerDocumentType)}
            />
            <Input
              label="Document URL"
              placeholder="https://…"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" isLoading={addDocument.isPending} disabled={!url.trim()}>
              Upload
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
