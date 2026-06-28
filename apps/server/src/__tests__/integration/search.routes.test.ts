import request from 'supertest'
import { createApp } from '../../app'
import * as searchService from '../../services/search.service'

jest.mock('../../services/search.service', () => ({
  searchWorkers: jest.fn(),
  searchServices: jest.fn(),
}))

describe('search routes integration', () => {
  const app = createApp()

  const emptyResult = { items: [], total: 0, page: 1, limit: 20 }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(searchService.searchWorkers as jest.Mock).mockResolvedValue(emptyResult)
  })

  it('returns workers with pagination meta', async () => {
    ;(searchService.searchWorkers as jest.Mock).mockResolvedValue({
      items: [{ _id: 'w1' }],
      total: 1,
      page: 1,
      limit: 20,
    })

    const res = await request(app).get('/api/search/workers')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1 })
  })

  it('passes availability=true through to the service as a boolean', async () => {
    await request(app).get('/api/search/workers').query({ availability: 'true' })

    expect(searchService.searchWorkers).toHaveBeenCalledWith(
      expect.objectContaining({ availability: true }),
    )
  })

  it('leaves availability undefined when not provided', async () => {
    await request(app).get('/api/search/workers')

    expect(searchService.searchWorkers).toHaveBeenCalledWith(
      expect.objectContaining({ availability: undefined }),
    )
  })

  it('rejects an invalid availability value', async () => {
    const res = await request(app).get('/api/search/workers').query({ availability: 'maybe' })

    expect(res.status).toBe(422)
    expect(searchService.searchWorkers).not.toHaveBeenCalled()
  })

  it('forwards filter and sort params', async () => {
    await request(app)
      .get('/api/search/workers')
      .query({ categoryId: 'Electrical', minRating: '4', maxPrice: '900', sortBy: 'price' })

    expect(searchService.searchWorkers).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 'Electrical',
        minRating: 4,
        maxPrice: 900,
        sortBy: 'price',
      }),
    )
  })
})
