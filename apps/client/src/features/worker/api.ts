import apiClient from '@/lib/axios'

export interface WorkerProfileUser {
  _id: string
  name: string
  email?: string
  phone?: string
  profileImage: string | null
  address?: string
}

export type WorkerDocumentType = 'aadhaar' | 'photo' | 'certificate' | 'other'

export interface WorkerDocument {
  type: WorkerDocumentType
  url: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
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
  documents: WorkerDocument[]
}

export interface WorkerStats {
  totalJobs: number
  completedJobs: number
  activeJobs: number
  totalEarnings: number
  rating: { average: number; totalReviews: number }
  isAvailable: boolean
}

export interface UpsertWorkerProfileInput {
  categoryId: string
  skills: string[]
  bio?: string
  experienceYears?: number
  pricePerDay: number
  location?: { lat: number; lng: number }
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

// ─── Worker self-service ──────────────────────────────────────────────────────

export async function getWorkerStats(): Promise<WorkerStats> {
  const { data } = await apiClient.get<ApiEnvelope<WorkerStats>>('/workers/me/stats')
  return data.data
}

export async function upsertWorkerProfile(input: UpsertWorkerProfileInput): Promise<WorkerProfile> {
  const { data } = await apiClient.post<ApiEnvelope<WorkerProfile>>('/workers/profile', input)
  return data.data
}

export async function updateAvailability(isAvailable: boolean): Promise<WorkerProfile> {
  const { data } = await apiClient.patch<ApiEnvelope<WorkerProfile>>('/workers/availability', {
    isAvailable,
  })
  return data.data
}

export async function addWorkerDocument(input: {
  type: WorkerDocumentType
  url: string
}): Promise<WorkerProfile> {
  const { data } = await apiClient.post<ApiEnvelope<WorkerProfile>>('/workers/documents', input)
  return data.data
}
