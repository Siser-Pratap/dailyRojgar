import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'

export default function WorkerDocuments() {
  return (
    <PageShell title="Documents" subtitle="Upload and manage worker verification documents.">
      <SectionCard title="Verification documents">
        <div className="grid gap-3">
          {['Aadhaar card', 'Profile photo', 'Skill certificate'].map((doc, index) => (
            <div
              key={doc}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
            >
              <span className="font-semibold text-gray-950">{doc}</span>
              <StatusBadge status={index === 2 ? 'pending' : 'completed'} />
            </div>
          ))}
        </div>
        <button className="btn-primary btn-md mt-5">Upload document</button>
      </SectionCard>
    </PageShell>
  )
}
