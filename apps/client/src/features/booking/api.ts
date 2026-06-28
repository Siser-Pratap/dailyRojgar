import apiClient from '@/lib/axios'

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type BookingPaymentStatus =
  | 'unpaid'
  | 'created'
  | 'paid'
  | 'failed'
  | 'refund_initiated'
  | 'refunded'

export interface BookingParty {
  _id: string
  name: string
  profileImage: string | null
  phone?: string
}

export interface BookingAddress {
  street?: string
  city?: string
  state?: string
  pincode?: string
}

export interface BookingStatusEntry {
  status: BookingStatus
  by: string
  at: string
  reason?: string
}

export interface Booking {
  _id: string
  bookingNumber: string
  customerId: BookingParty
  workerId: BookingParty
  categoryId: string
  scheduledDate: string
  durationDays: number
  address: BookingAddress
  description?: string
  amount: number
  platformFee: number
  totalAmount: number
  paymentStatus: BookingPaymentStatus
  status: BookingStatus
  statusHistory: BookingStatusEntry[]
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  createdAt: string
}

export interface CreateBookingInput {
  workerId: string
  workerProfileId?: string
  categoryId: string
  scheduledDate: string
  durationDays?: number
  address?: BookingAddress
  location?: { lat: number; lng: number }
  description?: string
  amount: number
}

export interface ListBookingsParams {
  status?: BookingStatus
  page?: number
  limit?: number
}

export interface ListBookingsResult {
  items: Booking[]
  page: number
  limit: number
  total: number
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface PaginatedEnvelope<T> extends ApiEnvelope<T> {
  meta: { page: number; limit: number; total: number }
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { data } = await apiClient.post<ApiEnvelope<Booking>>('/bookings', input)
  return data.data
}

export async function listBookings(params: ListBookingsParams = {}): Promise<ListBookingsResult> {
  const query: Record<string, string | number> = {}
  if (params.status) query.status = params.status
  if (params.page) query.page = params.page
  if (params.limit) query.limit = params.limit
  const { data } = await apiClient.get<PaginatedEnvelope<Booking[]>>('/bookings', { params: query })
  return { items: data.data, ...data.meta }
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get<ApiEnvelope<Booking>>(`/bookings/${id}`)
  return data.data
}

export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  const { data } = await apiClient.patch<ApiEnvelope<Booking>>(`/bookings/${id}/cancel`, { reason })
  return data.data
}

export type WorkerBookingAction = 'accept' | 'reject' | 'start' | 'complete'

export async function workerBookingAction(
  id: string,
  action: WorkerBookingAction,
  reason?: string,
): Promise<Booking> {
  const body = action === 'reject' ? { reason } : undefined
  const { data } = await apiClient.patch<ApiEnvelope<Booking>>(`/bookings/${id}/${action}`, body)
  return data.data
}
