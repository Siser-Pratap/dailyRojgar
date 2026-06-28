import apiClient from '@/lib/axios'

export interface WorkerProfileUser {
  _id: string
  name: string
  email?: string
  phone?: string
  profileImage: string | null
  address?: string
}

/** Full public worker profile as returned by `GET /workers/:id`. */
export interface WorkerProfile {
  _id: string
  userId: WorkerProfileUser
  verificationStatus: 'draft' | 'under_review' | 'approved' | 'rejected'
  categoryId: string
  skills: string[]
  bio?: string
  experienceYears: number
  pricePerDay: number
  isAvailable: boolean
  rating: { average: number; totalReviews: number }
  totalJobs: number
  totalEarnings: number
}

export interface WorkerReview {
  _id: string
  customerId: { _id: string; name: string; profileImage: string | null } | string
  rating: number
  comment?: string
  reply?: { text: string; repliedAt: string }
  createdAt: string
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** `:id` is the worker's *user* id (the search results' `userId._id`). */
export async function getWorkerProfile(id: string): Promise<WorkerProfile> {
  const { data } = await apiClient.get<ApiEnvelope<WorkerProfile>>(`/workers/${id}`)
  return data.data
}

export async function getWorkerReviews(workerId: string): Promise<WorkerReview[]> {
  const { data } = await apiClient.get<ApiEnvelope<WorkerReview[]>>(`/reviews/worker/${workerId}`)
  return data.data
}
