import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { PublicLayout } from '@/components/layout'
import { serviceCategories } from '../serviceCategories'

export default function ServicesPage() {
  return (
    <PublicLayout>
      <main className="container py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Services</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950">Find help across 10 categories</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Every category supports verified profiles, ratings, pricing, availability, and booking
          requests.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {serviceCategories.map((service) => (
            <Link
              key={service.name}
              to={ROUTES.CUSTOMER_SEARCH}
              className="card p-5 hover:shadow-card-hover"
            >
              <span className="text-3xl">{service.icon}</span>
              <h2 className="mt-4 font-bold text-gray-950">{service.name}</h2>
              <p className="text-sm text-gray-500">{service.jobs}</p>
            </Link>
          ))}
        </div>
      </main>
    </PublicLayout>
  )
}
