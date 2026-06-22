import { PageShell, SectionCard } from '@/features/phase8/components'
import { PriceRecommendationPanel, ProfileAssistantPanel } from '@/features/ai/components'

export default function WorkerProfileEdit() {
  return (
    <PageShell
      title="Worker profile"
      subtitle="Edit skills, pricing, location, and public profile details."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SectionCard title="Profile form">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="input" defaultValue="Electrical" />
            <input className="input" defaultValue="850" />
            <input
              className="input md:col-span-2"
              defaultValue="Wiring, Fan repair, Switch boards"
            />
            <textarea
              className="input min-h-28 md:col-span-2"
              defaultValue="Experienced electrician available for home and shop repairs."
            />
            <button className="btn-primary btn-md w-fit">Save profile</button>
          </div>
        </SectionCard>
        <div className="grid gap-6">
          <PriceRecommendationPanel />
          <ProfileAssistantPanel />
        </div>
      </div>
    </PageShell>
  )
}
