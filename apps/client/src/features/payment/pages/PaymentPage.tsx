import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageShell, SectionCard, StatusBadge } from '@/features/phase8/components'
import { bookings, payments } from '@/features/phase8/mockData'
import { formatCurrency } from '@/lib/utils'
import apiClient from '@/lib/axios'

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayCheckoutResponse) => Promise<void>
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
}

interface RazorpayCheckoutResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface CreateOrderResponse {
  orderId: string
  amount: number
  amountRupees: number
  currency: string
  keyId: string
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true)

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function PaymentPage() {
  const { bookingId } = useParams()
  const booking = bookings[0]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleOnlinePayment() {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please retry.')
      }

      const { data } = await apiClient.post<{ data: CreateOrderResponse }>(
        '/payments/create-order',
        { bookingId: bookingId ?? booking.id },
      )
      const order = data.data

      if (!order.keyId) {
        throw new Error('Razorpay key is not configured.')
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'dailyRojgar',
        description: `Payment for booking ${bookingId ?? booking.id}`,
        order_id: order.orderId,
        theme: { color: '#16a34a' },
        handler: async (response) => {
          await apiClient.post('/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
          setSuccess('Payment verified successfully. Your booking is confirmed.')
        },
      })

      checkout.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Secure payment"
      subtitle="Razorpay checkout handoff with transparent job pricing breakdown."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <SectionCard title="Choose payment method">
          <div className="grid gap-4 md:grid-cols-2">
            <button className="rounded-xl border-2 border-primary-600 bg-primary-50 p-5 text-left">
              <p className="font-bold text-gray-950">Online payment</p>
              <p className="mt-1 text-sm text-gray-600">
                Pay with UPI, cards, netbanking via Razorpay.
              </p>
            </button>
            <button className="rounded-xl border border-gray-200 bg-white p-5 text-left">
              <p className="font-bold text-gray-950">Cash after work</p>
              <p className="mt-1 text-sm text-gray-600">Record cash payment after completion.</p>
            </button>
          </div>
          <button
            className="btn-primary btn-lg mt-6 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={loading}
            onClick={handleOnlinePayment}
          >
            {loading ? 'Opening checkout…' : 'Open Razorpay checkout'}
          </button>
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {success && (
            <p className="mt-4 rounded-lg bg-primary-50 p-3 text-sm text-primary-800">{success}</p>
          )}
        </SectionCard>
        <SectionCard title="Pricing summary">
          <div className="grid gap-3 text-sm">
            <Row label="Worker charges" value={formatCurrency(850)} />
            <Row label="Platform fee" value={formatCurrency(85)} />
            <div className="border-t border-gray-200 pt-3">
              <Row label="Total" value={formatCurrency(booking.amount)} strong />
            </div>
            <StatusBadge status={payments[0].status} />
          </div>
        </SectionCard>
      </div>
    </PageShell>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={strong ? 'text-lg font-bold text-gray-950' : 'font-semibold text-gray-950'}>
        {value}
      </span>
    </div>
  )
}
