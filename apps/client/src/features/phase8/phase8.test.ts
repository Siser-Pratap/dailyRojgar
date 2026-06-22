import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/constants/routes'
import { bookings, serviceCategories, workers } from './mockData'

describe('Phase 8 frontend pages and flows', () => {
  it('keeps the required service catalog available for landing and search pages', () => {
    expect(serviceCategories).toHaveLength(10)
    expect(serviceCategories.map((service) => service.name)).toContain('Electrical')
  })

  it('provides mock workers and bookings for UI states and flow previews', () => {
    expect(workers.length).toBeGreaterThan(0)
    expect(bookings.length).toBeGreaterThan(0)
    expect(workers[0]).toMatchObject({ available: true, rating: expect.any(Number) })
  })

  it('exposes public and customer routes used by Phase 8 pages', () => {
    expect(ROUTES.SERVICES).toBe('/services')
    expect(ROUTES.ABOUT).toBe('/about')
    expect(ROUTES.CUSTOMER_SEARCH).toBe('/customer/search')
  })
})
