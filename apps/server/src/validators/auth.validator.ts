import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().min(10, 'Phone is required').max(15),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  role: z.enum(['customer', 'worker', 'admin']).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const phoneSchema = z.object({
  phone: z.string().trim().min(10).max(15),
})

export const verifyOtpSchema = phoneSchema.extend({
  otp: z.string().trim().min(4).max(8),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})
