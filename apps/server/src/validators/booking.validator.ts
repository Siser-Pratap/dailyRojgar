import { z } from 'zod'

export const createBookingSchema = z.object({
  workerId: z.string().min(1),
  workerProfileId: z.string().min(1).optional(),
  categoryId: z.string().trim().min(1),
  scheduledDate: z.coerce.date(),
  durationDays: z.coerce.number().min(1).optional().default(1),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      pincode: z.string().trim().optional(),
    })
    .optional()
    .default({}),
  location: z
    .object({
      lat: z.coerce.number().min(-90).max(90),
      lng: z.coerce.number().min(-180).max(180),
    })
    .optional(),
  description: z.string().trim().max(2000).optional(),
  amount: z.coerce.number().min(0),
})

export const bookingsQuerySchema = z.object({
  status: z
    .enum(['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled', 'disputed'])
    .optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const bookingIdParamSchema = z.object({ id: z.string().min(1) })

export const rejectBookingSchema = z.object({ reason: z.string().trim().max(500).optional() })
export const cancelBookingSchema = z.object({ reason: z.string().trim().max(500).optional() })
export const disputeBookingSchema = z.object({ reason: z.string().trim().min(5).max(1000) })
