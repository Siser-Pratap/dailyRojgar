import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1'

interface RazorpayOrderResponse {
  id: string
  amount: number
  currency: string
  receipt: string
  status: string
}

interface RazorpayRefundResponse {
  id: string
  payment_id: string
  amount: number
  status: string
}

function getAuthHeader() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw ApiError.internal('Razorpay credentials are not configured', 'PAYMENT_CONFIG')
  }

  return `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`
}

async function razorpayRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${RAZORPAY_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = (await response.json().catch(() => ({}))) as { error?: { description?: string } }

  if (!response.ok) {
    throw ApiError.badRequest(
      data.error?.description ?? 'Razorpay request failed',
      'RAZORPAY_REQUEST_FAILED',
    )
  }

  return data as T
}

export function toPaise(amountInRupees: number) {
  return Math.round(amountInRupees * 100)
}

export function fromPaise(amountInPaise: number) {
  return Math.round(amountInPaise) / 100
}

export async function createRazorpayOrder(input: {
  amountInRupees: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}) {
  return razorpayRequest<RazorpayOrderResponse>('/orders', {
    amount: toPaise(input.amountInRupees),
    currency: input.currency ?? 'INR',
    receipt: input.receipt,
    notes: input.notes ?? {},
  })
}

export async function createRazorpayRefund(input: {
  paymentId: string
  amountInRupees: number
  notes?: Record<string, string>
}) {
  return razorpayRequest<RazorpayRefundResponse>(`/payments/${input.paymentId}/refund`, {
    amount: toPaise(input.amountInRupees),
    speed: 'normal',
    notes: input.notes ?? {},
  })
}
