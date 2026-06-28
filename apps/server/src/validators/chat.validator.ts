import { z } from 'zod'

export const chatBookingParamSchema = z.object({ bookingId: z.string().min(1) })
