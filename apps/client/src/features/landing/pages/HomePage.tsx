import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/components/layout'
import { serviceCategories } from '../serviceCategories'

const customerSteps = [
  'Search verified workers',
  'Book by date and location',
  'Pay securely after confirmation',
]
const workerSteps = [
  'Create your skill profile',
  'Accept nearby jobs',
  'Earn with transparent payouts',
]

export default function HomePage() {
  return (
    <PublicLayout>
      <main>
        <section className="bg-gradient-to-br from-primary-50 via-white to-gray-50 py-20">
          <div className="container grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="badge-green mb-5">Verified daily wage workers near you</span>
              <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-6xl">
                Hire trusted help for every day work.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                dailyRojgar connects customers with skilled electricians, plumbers, cleaners,
                drivers, painters, and more — with ratings, availability, and secure payments.
              </p>
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-3 shadow-card md:flex">
                <input
                  className="input border-0 md:flex-1"
                  placeholder="What service do you need?"
                />
                <input
                  className="input mt-2 border-0 md:mt-0 md:w-56"
                  placeholder="Your location"
                />
                <Link to={ROUTES.CUSTOMER_SEARCH} className="btn-primary btn-lg mt-2 md:mt-0">
                  Search workers
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                {['4.8★ average', '10k+ jobs', '24h support'].map((item) => (
                  <div key={item} className="rounded-lg bg-white p-4 shadow-card">
                    <p className="font-bold text-gray-950">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <div className="rounded-2xl bg-gray-950 p-6 text-white">
                <p className="text-sm text-primary-200">Live worker match</p>
                <h2 className="mt-2 text-2xl font-bold">Electrician available in 1.2 km</h2>
                <p className="mt-3 text-gray-300">Ramesh Kumar • 4.9 rating • ₹850/day</p>
                <div className="mt-6 grid gap-3">
                  {['Verified Aadhaar', '312 completed jobs', 'Can arrive by 2:30 PM'].map(
                    (item) => (
                      <div key={item} className="rounded-lg bg-white/10 p-3 text-sm">
                        ✓ {item}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
                Services
              </p>
              <h2 className="text-3xl font-bold text-gray-950">Popular categories</h2>
            </div>
            <Link to={ROUTES.SERVICES} className="btn-outline btn-md">
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {serviceCategories.map((service) => (
              <Link
                key={service.name}
                to={ROUTES.CUSTOMER_SEARCH}
                className="card p-5 transition hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="text-3xl">{service.icon}</span>
                <h3 className="mt-4 font-bold text-gray-950">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.jobs}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="container grid gap-8 lg:grid-cols-2">
            <Flow title="For customers" steps={customerSteps} />
            <Flow title="For workers" steps={workerSteps} />
          </div>
        </section>

        <section className="container py-16">
          <div className="grid items-center gap-8 rounded-2xl bg-gray-950 p-8 text-white lg:grid-cols-2">
            <div>
              <p className="text-primary-200">Earn with your skills</p>
              <h2 className="mt-2 text-3xl font-bold">Join dailyRojgar as a verified worker</h2>
              <p className="mt-3 text-gray-300">
                Get nearby jobs, manage availability, and track earnings from one dashboard.
              </p>
            </div>
            <div className="flex gap-3 lg:justify-end">
              <Link to={ROUTES.REGISTER} className="btn-primary btn-lg">
                Join as worker
              </Link>
              <Link
                to={ROUTES.ABOUT}
                className="btn-outline btn-lg border-white/30 text-white hover:text-white"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  )
}

function Flow({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-gray-950">{title}</h3>
      <div className="mt-5 grid gap-4">
        {steps.map((step, index) => (
          <div key={step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-gray-700">{step}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
