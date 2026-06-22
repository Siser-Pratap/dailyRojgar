import { z } from 'zod'

export const moderationIdParamSchema = z.object({ id: z.string().min(1) })

export const documentDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
})

export const disputeDecisionSchema = z.object({
  status: z.enum(['resolved', 'rejected']),
})
