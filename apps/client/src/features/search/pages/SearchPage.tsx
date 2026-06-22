import { PageShell, StateShowcase, WorkerCard } from '@/features/phase8/components'
import { serviceCategories, workers } from '@/features/phase8/mockData'
import { SmartMatchingPanel } from '@/features/ai/components'

export default function SearchPage() {
  return (
    <PageShell
      title="Search nearby workers"
      subtitle="Filter by skill, location, rating, price, and live availability."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card h-fit p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-950">Filters</h2>
          <div className="grid gap-4">
            <label className="text-sm font-semibold text-gray-700">
              Location
              <input className="input mt-2" placeholder="Auto-detect or enter area" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Service category
              <select className="input mt-2">
                {serviceCategories.map((service) => (
                  <option key={service.name}>{service.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Maximum price/day
              <input className="input mt-2" type="range" min="300" max="1500" defaultValue="900" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Minimum rating
              <select className="input mt-2">
                <option>4 stars & above</option>
                <option>3 stars & above</option>
              </select>
            </label>
            <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm font-semibold text-gray-700">
              <span>Available now</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary-600" />
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Sort by
              <select className="input mt-2">
                <option>Distance</option>
                <option>Rating</option>
                <option>Price</option>
                <option>Reviews</option>
              </select>
            </label>
          </div>
        </aside>
        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing {workers.length} verified workers</p>
            <span className="badge-green">Live availability</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
          <div className="card mt-6 p-5">
            <h2 className="font-bold text-gray-950">Map view</h2>
            <div className="mt-4 flex h-56 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
              Nearby worker pins preview
            </div>
          </div>
          <div className="mt-6">
            <SmartMatchingPanel />
          </div>
          <div className="mt-6 flex justify-center gap-2">
            <button className="btn-outline btn-sm">Previous</button>
            <button className="btn-primary btn-sm">1</button>
            <button className="btn-outline btn-sm">Next</button>
          </div>
          <div className="mt-8">
            <StateShowcase />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
