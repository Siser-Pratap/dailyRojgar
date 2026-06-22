import rateLimit from 'express-rate-limit'
import { ApiError } from '../utils/ApiError'

/** General API rate limiter: 100 requests per 15 minutes per IP */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many requests, please try again later'))
  },
})

/** Strict limiter for auth endpoints: 10 requests per 15 minutes per IP */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many auth attempts, please try again later'))
  },
})

/** OTP verification limiter: 5 requests per minute per IP */
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Too many OTP attempts, please try again later'))
  },
})

/** Upload limiter: 20 requests per hour per IP */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  handler: (_req, _res, next) => {
    next(ApiError.tooManyRequests('Upload limit reached, please try again later'))
  },
})
