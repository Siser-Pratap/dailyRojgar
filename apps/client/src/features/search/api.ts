import apiClient from '@/lib/axios'

export type WorkerSortBy = 'rating' | 'price' | 'distance' | 'reviews' | 'smart'

/** A worker profile as returned by the search endpoint (with populated user). */
export interface SearchWorker {
  _id: string
  userId: {
    _id: string
    name: string
    email?: string
    phone?: string
    profileImage: string | null
    address?: string
  }
  verificationStatus: 'draft' | 'under_review' | 'approved' | 'rejected'
  categoryId: string
  skills: string[]
  bio?: string
  experienceYears: number
  pricePerDay: number
  isAvailable: boolean
  rating: { average: number; totalReviews: number }
  totalJobs: number
  distance: number | null
  smartMatchScore: number
}

export interface SearchWorkersParams {
  q?: string
  categoryId?: string
  minRating?: number
  maxPrice?: number
  availability?: boolean
  sortBy?: WorkerSortBy
  lat?: number
  lng?: number
  radius?: number
  page?: number
  limit?: number
}

export interface SearchWorkersResult {
  items: SearchWorker[]
  page: number
  limit: number
  total: number
}

interface PaginatedEnvelope<T> {
  success: boolean
  message: string
  data: T
  meta: { page: number; limit: number; total: number }
}

/** Strips empty / undefined values so we don't send blank query params. */
function cleanParams(params: SearchWorkersParams): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value
  }
  return out
}

export async function searchWorkers(params: SearchWorkersParams): Promise<SearchWorkersResult> {
  const { data } = await apiClient.get<PaginatedEnvelope<SearchWorker[]>>('/search/workers', {
    params: cleanParams(params),
  })
  return { items: data.data, ...data.meta }
}
