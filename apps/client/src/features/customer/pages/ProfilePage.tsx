import { PageShell, SectionCard } from '@/features/phase8/components'

export default function CustomerProfile() {
  return (
    <PageShell
      title="Profile settings"
      subtitle="Manage customer contact details, saved addresses, and notification preferences."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Personal details">
          <div className="grid gap-4">
            <input className="input" placeholder="Full name" defaultValue="Amit Sharma" />
            <input className="input" placeholder="Phone" defaultValue="9876543210" />
            <input className="input" placeholder="Email" defaultValue="amit@example.com" />
            <button className="btn-primary btn-md w-fit">Save changes</button>
          </div>
        </SectionCard>
        <SectionCard title="Saved address">
          <textarea className="input min-h-32" defaultValue="Sector 22, Noida, Uttar Pradesh" />
          <button className="btn-outline btn-md mt-4">Add another address</button>
        </SectionCard>
      </div>
    </PageShell>
  )
}
