import { z } from 'zod'

export const searchWorkersQuerySchema = z.object({
  q: z.string().trim().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().min(1).max(50).optional().default(10),
  categoryId: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  availability: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  sortBy: z.enum(['rating', 'price', 'distance', 'reviews', 'smart']).optional().default('rating'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const searchServicesQuerySchema = z.object({
  q: z.string().trim().optional(),
})
