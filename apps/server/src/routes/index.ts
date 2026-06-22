import { Router, Request, Response } from 'express'
import mongoose from 'mongoose'
import { getRedisClient } from '../config/redis'
import authRoutes from './auth.routes'
import searchRoutes from './search.routes'
import workerRoutes from './workers.routes'
import bookingRoutes from './bookings.routes'
import paymentRoutes from './payments.routes'
import reviewRoutes from './reviews.routes'
import notificationRoutes from './notifications.routes'
import adminRoutes from './admin.routes'

const router = Router()

// ─── Health check ─────────────────────────────────────────────────────────────
router.get('/health', async (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'

  let redisState = 'disconnected'
  try {
    const redis = getRedisClient()
    await redis.ping()
    redisState = 'connected'
  } catch {
    redisState = 'disconnected'
  }

  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: dbState,
    redis: redisState,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.0.0',
  })
})

// ─── Domain routes ──────────────────────────────────────────────────────────
router.use('/auth', authRoutes)
router.use('/search', searchRoutes)
router.use('/workers', workerRoutes)
router.use('/bookings', bookingRoutes)
router.use('/payments', paymentRoutes)
router.use('/reviews', reviewRoutes)
router.use('/notifications', notificationRoutes)
router.use('/admin', adminRoutes)

export default router
