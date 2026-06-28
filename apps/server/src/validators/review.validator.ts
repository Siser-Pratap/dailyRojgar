import { z } from 'zod'

export const createReviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
})

export const workerReviewsParamSchema = z.object({ workerId: z.string().min(1) })
export const bookingReviewParamSchema = z.object({ bookingId: z.string().min(1) })
export const reviewIdParamSchema = z.object({ id: z.string().min(1) })

export const replyReviewSchema = z.object({
  text: z.string().trim().min(1).max(1000),
})
