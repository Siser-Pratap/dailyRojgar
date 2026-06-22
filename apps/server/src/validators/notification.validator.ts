import { z } from 'zod'

export const notificationsQuerySchema = z.object({
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
})

export const notificationIdParamSchema = z.object({ id: z.string().min(1) })

export const fcmTokenSchema = z.object({
  token: z.string().trim().min(16).max(4096),
})
