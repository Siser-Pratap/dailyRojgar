import { z } from 'zod'

export const smartMatchQuerySchema = z.object({
  q: z.string().trim().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(50).optional().default(10),
  categoryId: z.string().trim().optional(),
  limit: z.coerce.number().min(1).max(20).optional().default(10),
})

export const priceRecommendationSchema = z.object({
  categoryId: z.string().trim().min(1),
  pincode: z.string().trim().min(4).max(10).optional(),
  scheduledAt: z.coerce.date().optional(),
  estimatedHours: z.coerce.number().min(1).max(12).optional().default(8),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
})

export const profileAssistantSchema = z.object({
  bio: z.string().trim().max(1000).optional().default(''),
  skills: z.array(z.string().trim().min(1)).optional().default([]),
  categoryId: z.string().trim().optional(),
  pricePerDay: z.coerce.number().min(0).optional(),
})
