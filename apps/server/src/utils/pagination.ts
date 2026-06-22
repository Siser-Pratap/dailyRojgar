import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '../config/constants'

export interface PaginationQuery {
  page?: number
  limit?: number
}

export interface PaginationResult {
  page: number
  limit: number
  skip: number
}

export function parsePagination(query: PaginationQuery): PaginationResult {
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(
    PAGINATION_MAX_LIMIT,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULT_LIMIT),
  )
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function buildPaginationMeta(total: number, { page, limit }: PaginationResult) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  }
}
