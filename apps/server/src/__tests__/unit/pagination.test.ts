import { buildPaginationMeta, parsePagination } from '../../utils/pagination'

describe('pagination utilities', () => {
  it('normalizes invalid pagination input', () => {
    expect(parsePagination({ page: -2, limit: 0 })).toEqual({ page: 1, limit: 20, skip: 0 })
  })

  it('caps large limits and computes skip', () => {
    expect(parsePagination({ page: 3, limit: 999 })).toEqual({ page: 3, limit: 50, skip: 100 })
  })

  it('builds navigation metadata', () => {
    expect(buildPaginationMeta(125, { page: 2, limit: 50, skip: 50 })).toMatchObject({
      total: 125,
      page: 2,
      limit: 50,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    })
  })
})
