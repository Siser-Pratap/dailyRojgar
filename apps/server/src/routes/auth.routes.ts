import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { otpRateLimiter } from '../middleware/rateLimit.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  forgotPasswordSchema,
  loginSchema,
  phoneSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from '../validators/auth.validator'

const router = Router()

router.post('/register', validate(registerSchema), AuthController.register)
router.post('/login', validate(loginSchema), AuthController.login)
router.post('/refresh', validate(refreshSchema), AuthController.refresh)
router.post('/logout', authenticate, AuthController.logout)
router.post('/verify-otp', otpRateLimiter, validate(verifyOtpSchema), AuthController.verifyOtp)
router.post('/resend-otp', validate(phoneSchema), AuthController.resendOtp)
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword)
router.get('/me', authenticate, AuthController.me)

export default router
