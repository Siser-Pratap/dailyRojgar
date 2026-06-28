import apiClient from '@/lib/axios'

interface ApiEnvelope<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AdminMetrics {
  users: number
  newToday: number
  workers: number
  activeWorkers: number
  bookingsToday: number
  revenueToday: number
  pendingDisputes: number
  pendingVerifications: number
  revenue: number
}

interface PartyRef {
  _id: string
  name: string
  email?: string
  phone?: string
}

export interface AdminUser {
  _id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'worker' | 'admin'
  isActive: boolean
  isVerified: boolean
  createdAt: string
}

export interface AdminWorkerDocument {
  _id: string
  type: string
  url: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface AdminWorkerProfile {
  _id: string
  userId: PartyRef | string
  categoryId: string
  skills: string[]
  pricePerDay?: number
  verificationStatus: string
  rejectionReason?: string
  rating?: { average: number; totalReviews: number }
  documents: AdminWorkerDocument[]
}

export interface AdminBooking {
  _id: string
  bookingNumber: string
  categoryId: string
  status: string
  paymentStatus: string
  amount: number
  totalAmount: number
  customerId?: PartyRef
  workerId?: PartyRef
  createdAt: string
}

export interface AdminPayment {
  _id: string
  providerPaymentId?: string
  status: string
  amount: number
  workerPayout: number
  currency: string
  bookingId: string
  customerId?: PartyRef
  workerId?: PartyRef
}

export interface AdminDispute {
  _id: string
  bookingNumber: string
  status: string
  dispute?: { reason?: string; status?: string }
  customerId?: PartyRef
  workerId?: PartyRef
}

export interface AdminWorkerDetail {
  profile: AdminWorkerProfile
  bookings: AdminBooking[]
  payments: AdminPayment[]
  reviews: Array<Record<string, unknown>>
}

export async function fetchAdminDashboard() {
  const { data } = await apiClient.get<ApiEnvelope<AdminMetrics>>('/admin/dashboard')
  return data.data
}

export async function fetchAdminUsers() {
  const { data } = await apiClient.get<ApiEnvelope<AdminUser[]>>('/admin/users')
  return data.data
}

export async function fetchAdminWorkers(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminWorkerProfile[]>>('/admin/workers', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function fetchAdminWorkerDetail(workerId: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminWorkerDetail>>(`/admin/workers/${workerId}`)
  return data.data
}

export async function updateWorkerVerification(
  workerId: string,
  payload: { status: 'approved' | 'rejected'; rejectionReason?: string },
) {
  const { data } = await apiClient.patch<ApiEnvelope<AdminWorkerProfile>>(
    `/admin/workers/${workerId}/verification`,
    payload,
  )
  return data.data
}

export async function reviewWorkerDocument(
  workerId: string,
  documentId: string,
  payload: { status: 'approved' | 'rejected'; rejectionReason?: string },
) {
  const { data } = await apiClient.patch<ApiEnvelope<AdminWorkerProfile>>(
    `/admin/workers/${workerId}/documents/${documentId}`,
    payload,
  )
  return data.data
}

export async function fetchAdminBookings(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminBooking[]>>('/admin/bookings', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function fetchAdminPayments(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminPayment[]>>('/admin/payments', {
    params: status ? { status } : undefined,
  })
  return data.data
}

/** Issues a refund for a captured payment (admin only). */
export async function refundPayment(paymentId: string, reason?: string) {
  const { data } = await apiClient.post<ApiEnvelope<AdminPayment>>(
    `/payments/${paymentId}/refund`,
    {
      reason,
    },
  )
  return data.data
}

export async function fetchAdminDisputes() {
  const { data } = await apiClient.get<ApiEnvelope<AdminDispute[]>>('/admin/reports')
  return data.data
}

export async function resolveDispute(
  bookingId: string,
  payload: { resolution: 'customer' | 'worker' | 'partial'; refundAmount?: number; notes?: string },
) {
  const { data } = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
    `/admin/disputes/${bookingId}`,
    payload,
  )
  return data.data
}
