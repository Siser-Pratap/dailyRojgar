import { Footer, PublicNav, StateShowcase } from '@/features/phase8/components'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      <main className="container py-12">
        <span className="badge-green">About dailyRojgar</span>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold text-gray-950">
          Building trust between skilled daily wage workers and local customers.
        </h1>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {[
            'Verified identity and documents',
            'Transparent pricing and ratings',
            'Realtime chat and notifications',
          ].map((item) => (
            <div key={item} className="card p-6">
              <h2 className="font-bold text-gray-950">{item}</h2>
              <p className="mt-2 text-sm text-gray-600">
                Designed for reliable local work with clear communication and secure payments.
              </p>
            </div>
          ))}
        </div>
        <section className="mt-10">
          <StateShowcase />
        </section>
      </main>
      <Footer />
    </div>
  )
}
