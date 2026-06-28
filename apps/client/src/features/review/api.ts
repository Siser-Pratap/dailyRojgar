import apiClient from '@/lib/axios'

export interface Review {
  _id: string
  bookingId: string
  customerId: { _id: string; name: string; profileImage: string | null } | string
  workerId: string
  rating: number
  comment?: string
  reply?: { text: string; repliedAt: string }
  createdAt: string
}

export interface CreateReviewInput {
  bookingId: string
  rating: number
  comment?: string
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const { data } = await apiClient.post<ApiEnvelope<Review>>('/reviews', input)
  return data.data
}

/** Returns the review for a booking, or null if none exists yet. */
export async function getReviewByBooking(bookingId: string): Promise<Review | null> {
  const { data } = await apiClient.get<ApiEnvelope<Review | null>>(`/reviews/booking/${bookingId}`)
  return data.data
}
