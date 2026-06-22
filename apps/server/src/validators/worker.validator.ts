import { z } from 'zod'

const locationSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
})

export const listWorkersQuerySchema = z.object({
  q: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  availability: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const workerIdParamSchema = z.object({ id: z.string().min(1) })

export const upsertWorkerProfileSchema = z.object({
  categoryId: z.string().trim().min(1),
  skills: z.array(z.string().trim().min(1)).min(1),
  bio: z.string().trim().max(1000).optional(),
  experienceYears: z.coerce.number().min(0).optional().default(0),
  pricePerDay: z.coerce.number().min(0),
  location: locationSchema.optional(),
})

export const availabilitySchema = z.object({
  isAvailable: z.boolean(),
})

export const workerDocumentSchema = z.object({
  type: z.enum(['aadhaar', 'photo', 'certificate', 'other']),
  url: z.string().trim().url(),
})
