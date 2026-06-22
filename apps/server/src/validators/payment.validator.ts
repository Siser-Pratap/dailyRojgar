import { z } from 'zod'

export const createOrderSchema = z.object({
  bookingId: z.string().min(1),
})

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().min(1),
})

export const paymentBookingParamSchema = z.object({ bookingId: z.string().min(1) })
export const paymentIdParamSchema = z.object({ id: z.string().min(1) })

export const refundSchema = z.object({ reason: z.string().trim().max(500).optional() })
