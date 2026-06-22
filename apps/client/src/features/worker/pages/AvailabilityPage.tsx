import { PageShell, SectionCard } from '@/features/phase8/components'

export default function WorkerAvailability() {
  return (
    <PageShell title="Availability" subtitle="Control when customers can discover and book you.">
      <SectionCard title="Available now">
        <div className="flex items-center justify-between rounded-xl bg-primary-50 p-5">
          <div>
            <p className="font-bold text-gray-950">Accept nearby jobs</p>
            <p className="text-sm text-gray-600">Toggle off when you are busy or unavailable.</p>
          </div>
          <input type="checkbox" defaultChecked className="h-6 w-6 accent-primary-600" />
        </div>
      </SectionCard>
    </PageShell>
  )
}
