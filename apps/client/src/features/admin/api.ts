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

export interface AdminWorkerProfile {
  _id: string
  userId: { _id: string; name: string; email?: string; phone?: string } | string
  categoryId: string
  skills: string[]
  verificationStatus: string
  rejectionReason?: string
  documents: Array<{ _id: string; type: string; url: string; status: string }>
}

export async function fetchAdminDashboard() {
  const { data } = await apiClient.get<ApiEnvelope<AdminMetrics>>('/admin/dashboard')
  return data.data
}

export async function fetchAdminUsers() {
  const { data } = await apiClient.get<ApiEnvelope<Array<Record<string, unknown>>>>('/admin/users')
  return data.data
}

export async function fetchAdminWorkers(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<AdminWorkerProfile[]>>('/admin/workers', {
    params: status ? { status } : undefined,
  })
  return data.data
}

export async function fetchAdminWorkerDetail(workerId: string) {
  const { data } = await apiClient.get<ApiEnvelope<{ profile: AdminWorkerProfile }>>(
    `/admin/workers/${workerId}`,
  )
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

export async function fetchAdminBookings(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<Array<Record<string, unknown>>>>(
    '/admin/bookings',
    {
      params: status ? { status } : undefined,
    },
  )
  return data.data
}

export async function fetchAdminPayments(status?: string) {
  const { data } = await apiClient.get<ApiEnvelope<Array<Record<string, unknown>>>>(
    '/admin/payments',
    {
      params: status ? { status } : undefined,
    },
  )
  return data.data
}

export async function fetchAdminDisputes() {
  const { data } =
    await apiClient.get<ApiEnvelope<Array<Record<string, unknown>>>>('/admin/reports')
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
