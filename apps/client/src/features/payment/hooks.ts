import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { getApiErrorMessage } from '@/lib/apiError'
import { createPaymentOrder, verifyPayment } from './api'

interface RazorpayCheckoutResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpayCheckoutResponse) => void
  prefill?: { name?: string; email?: string; contact?: string }
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
  open: () => void
  on: (event: string, handler: (response: unknown) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Orchestrates a Razorpay checkout for a booking: creates an order, opens the
 * widget, verifies the signature server-side, then runs `onSuccess`.
 */
export function useRazorpayCheckout() {
  const { user } = useAuth()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)

  async function startPayment(
    bookingId: string,
    options: { description?: string; onSuccess?: () => void } = {},
  ) {
    setIsProcessing(true)
    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please retry.')
      }

      const order = await createPaymentOrder(bookingId)
      if (!order.keyId) {
        throw new Error('Razorpay is not configured. Please contact support.')
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'dailyRojgar',
        description: options.description ?? `Payment for booking ${bookingId}`,
        order_id: order.orderId,
        theme: { color: '#16a34a' },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.info('Payment cancelled')
          },
        },
        handler: (response) => {
          void finishPayment(response, bookingId, options.onSuccess)
        },
      })

      checkout.on('payment.failed', () => {
        setIsProcessing(false)
        toast.error('Payment failed. Please try again.')
      })

      checkout.open()
    } catch (error) {
      setIsProcessing(false)
      toast.error(getApiErrorMessage(error, 'Could not start payment'))
    }
  }

  async function finishPayment(
    response: RazorpayCheckoutResponse,
    bookingId: string,
    onSuccess?: () => void,
  ) {
    try {
      await verifyPayment({
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      })
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['payment', bookingId] })
      toast.success('Payment successful — booking confirmed')
      onSuccess?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Payment verification failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  return { startPayment, isProcessing }
}
