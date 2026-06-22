import { z } from 'zod'

export const moderationIdParamSchema = z.object({ id: z.string().min(1) })

export const adminListQuerySchema = z.object({
  q: z.string().trim().optional(),
  role: z.enum(['customer', 'worker', 'admin']).optional(),
  status: z.string().trim().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const adminWorkerParamSchema = z.object({ workerId: z.string().min(1) })

export const adminWorkerDocumentParamSchema = z.object({
  workerId: z.string().min(1),
  documentId: z.string().min(1),
})

export const documentDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().trim().max(1000).optional(),
})

export const workerVerificationDecisionSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejectionReason: z.string().trim().max(1000).optional(),
})

export const disputeDecisionSchema = z.object({
  resolution: z.enum(['customer', 'worker', 'partial']),
  refundAmount: z.coerce.number().min(1).optional(),
  notes: z.string().trim().max(1000).optional(),
})
