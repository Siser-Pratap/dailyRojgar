import apiClient from '@/lib/axios'

export type PaymentStatus = 'created' | 'captured' | 'failed' | 'refund_initiated' | 'refunded'

export interface CreateOrderResponse {
  orderId: string
  /** Amount in paise (for the Razorpay checkout widget). */
  amount: number
  /** Amount in rupees (for display). */
  amountRupees: number
  currency: string
  keyId?: string
}

export interface VerifyPaymentInput {
  orderId: string
  paymentId: string
  signature: string
}

export interface Payment {
  _id: string
  bookingId: string
  status: PaymentStatus
  amount: number
  baseAmount: number
  platformFee: number
  workerPayout: number
  currency: string
  capturedAt?: string
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export async function createPaymentOrder(bookingId: string): Promise<CreateOrderResponse> {
  const { data } = await apiClient.post<ApiEnvelope<CreateOrderResponse>>(
    '/payments/create-order',
    { bookingId },
  )
  return data.data
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<Payment> {
  const { data } = await apiClient.post<ApiEnvelope<Payment>>('/payments/verify', input)
  return data.data
}

export async function getPaymentByBooking(bookingId: string): Promise<Payment> {
  const { data } = await apiClient.get<ApiEnvelope<Payment>>(`/payments/${bookingId}`)
  return data.data
}
