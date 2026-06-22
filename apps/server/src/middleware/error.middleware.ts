import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import { captureException } from '../config/sentry'

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // ─── Zod validation errors ─────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errorCode: 'VALIDATION',
      details,
    })
    return
  }

  // ─── Known operational errors ──────────────────────────────────────────────
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error('ApiError 5xx', {
        requestId: req.requestId,
        userId: req.user?.sub ?? null,
        message: err.message,
        errorCode: err.errorCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
      })
      captureException(err, {
        requestId: req.requestId,
        userId: req.user?.sub ?? null,
        path: req.path,
        method: req.method,
        extra: { errorCode: err.errorCode },
      })
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.details.length > 0 && { details: err.details }),
    })
    return
  }

  // ─── Unknown errors ────────────────────────────────────────────────────────
  logger.error('Unhandled error', {
    requestId: req.requestId,
    userId: req.user?.sub ?? null,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
    path: req.path,
    method: req.method,
  })

  captureException(err, {
    requestId: req.requestId,
    userId: req.user?.sub ?? null,
    path: req.path,
    method: req.method,
  })

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: 'INTERNAL',
  })
}
