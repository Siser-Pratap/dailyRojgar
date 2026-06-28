import apiClient from '@/lib/axios'

interface ApiEnvelope<T> {
  data: T
}

export interface SmartMatchWorker {
  _id: string
  categoryId: string
  pricePerDay: number
  distance: number | null
  smartMatch: {
    score: number
    breakdown: Record<string, number>
    explanation: string[]
  }
}

export interface PriceRecommendation {
  categoryId: string
  baseline: number
  estimatedHours: number
  suggestedPrice: number
  suggestedRange: { min: number; max: number }
  factors: {
    locationMultiplier: number
    timeMultiplier: number
    supplyDemandMultiplier: number
    availableWorkers: number
    demandBookings: number
  }
}

export interface ProfileSuggestions {
  assistant: string
  aiEnabled?: boolean
  suggestions: Array<{ type: string; title: string; detail: string }>
  improvedBio?: string
  nextBestAction: string
}

export async function fetchSmartWorkerMatches(params?: {
  categoryId?: string
  lat?: number
  lng?: number
  q?: string
}) {
  const { data } = await apiClient.get<
    ApiEnvelope<{ items: SmartMatchWorker[]; algorithm: string }>
  >('/ai/matches/workers', { params })
  return data.data
}

export async function fetchPriceRecommendation(payload: {
  categoryId: string
  pincode?: string
  estimatedHours?: number
}) {
  const { data } = await apiClient.post<ApiEnvelope<PriceRecommendation>>(
    '/ai/price-recommendation',
    payload,
  )
  return data.data
}

export async function fetchProfileSuggestions(payload: {
  bio: string
  skills: string[]
  categoryId: string
  pricePerDay: number
}) {
  const { data } = await apiClient.post<ApiEnvelope<ProfileSuggestions>>(
    '/ai/assistant/profile-suggestions',
    payload,
  )
  return data.data
}
