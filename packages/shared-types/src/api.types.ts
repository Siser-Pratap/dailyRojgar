export interface ApiSuccessResponse<T = unknown> {
  success: true
  message: string
  data?: T
  meta?: PaginationMeta
}

export interface ApiErrorResponse {
  success: false
  message: string
  errorCode: string
  details?: ValidationError[]
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ValidationError {
  field: string
  message: string
}

export interface SearchWorkersQuery {
  q?: string
  lat?: number
  lng?: number
  radius?: number
  categoryId?: string
  minRating?: number
  maxPrice?: number
  availability?: boolean
  sortBy?: 'rating' | 'price' | 'distance' | 'reviews'
  page?: number
  limit?: number
}

export interface Notification {
  _id: string
  userId: string
  type:
    | 'booking_new'
    | 'booking_accepted'
    | 'booking_completed'
    | 'payment_received'
    | 'review_received'
    | 'chat_message'
    | 'worker_approved'
    | 'system'
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  readAt: string | null
  createdAt: string
}
