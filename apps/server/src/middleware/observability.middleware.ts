import { randomUUID } from 'crypto'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { recordHttpRequest } from '../services/metrics.service'

declare global {
  namespace Express {
    interface Request {
      requestId?: string
      startedAt?: bigint
    }
  }
}

function getRouteLabel(req: Request) {
  return req.route?.path ? `${req.baseUrl}${req.route.path}` : req.originalUrl.split('?')[0]
}

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingRequestId = req.headers['x-request-id']
  req.requestId = Array.isArray(incomingRequestId) ? incomingRequestId[0] : incomingRequestId
  req.requestId ||= randomUUID()
  req.startedAt = process.hrtime.bigint()

  res.setHeader('X-Request-ID', req.requestId)

  const originalWriteHead = res.writeHead.bind(res)
  res.writeHead = ((...args: Parameters<Response['writeHead']>) => {
    const durationMs =
      Number(process.hrtime.bigint() - (req.startedAt ?? process.hrtime.bigint())) / 1_000_000
    if (!res.hasHeader('X-Response-Time')) {
      res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`)
    }
    return originalWriteHead(...args)
  }) as Response['writeHead']

  res.on('finish', () => {
    const durationMs =
      Number(process.hrtime.bigint() - (req.startedAt ?? process.hrtime.bigint())) / 1_000_000
    const route = getRouteLabel(req)

    if (route === '/api/health') return

    recordHttpRequest({
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs,
    })

    logger.info('HTTP request completed', {
      requestId: req.requestId,
      userId: req.user?.sub ?? null,
      method: req.method,
      path: req.originalUrl,
      route,
      statusCode: res.statusCode,
      responseTimeMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
    })
  })

  next()
}
