import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import { env } from './config/env'
import { generalRateLimiter, authRateLimiter } from './middleware/rateLimit.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import { httpLogStream } from './utils/logger'
import { requestContextMiddleware } from './middleware/observability.middleware'
import apiRoutes from './routes/index'

const xss = require('xss-clean')

export function createApp(): Application {
  const app = express()

  // ─── Security middleware (order matters) ─────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
    }),
  )

  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = [env.CLIENT_URL]
        if (!origin || allowed.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`CORS blocked: ${origin}`))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )

  // ─── Body parsing ─────────────────────────────────────────────────────────
  app.use(requestContextMiddleware)
  app.use(
    express.json({
      limit: '10kb',
      verify: (req, _res, buf) => {
        if (req.url?.startsWith('/api/payments/webhook')) {
          ;(req as Request & { rawBody?: string }).rawBody = buf.toString('utf8')
        }
      },
    }),
  )
  app.use(express.urlencoded({ extended: true, limit: '10kb' }))
  app.use(cookieParser())

  // ─── Data sanitization ────────────────────────────────────────────────────
  app.use(mongoSanitize()) // prevent NoSQL injection
  app.use(xss()) // sanitize HTML in request body/query/params
  app.use(hpp()) // prevent HTTP parameter pollution

  // ─── Compression & logging ────────────────────────────────────────────────
  app.use(compression())
  if (env.NODE_ENV !== 'test') {
    morgan.token('requestId', (req: Request) => req.requestId ?? '-')
    app.use(
      morgan(':requestId :method :url :status :response-time ms :remote-addr', {
        stream: httpLogStream,
        skip: (req) => req.originalUrl === '/api/health',
      }),
    )
  }

  // ─── Rate limiting ────────────────────────────────────────────────────────
  app.use('/api', generalRateLimiter)
  app.use('/api/auth', authRateLimiter)

  // ─── Routes ───────────────────────────────────────────────────────────────
  app.use('/api', apiRoutes)

  // ─── 404 handler ──────────────────────────────────────────────────────────
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    const { ApiError } = require('./utils/ApiError')
    next(ApiError.notFound('Route'))
  })

  // ─── Global error handler (must be last) ─────────────────────────────────
  app.use(errorMiddleware)

  return app
}
