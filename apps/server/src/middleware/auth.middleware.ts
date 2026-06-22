import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { ApiError } from '../utils/ApiError'
import { getRedisClient } from '../config/redis'

export interface JWTPayload {
  sub: string
  role: 'customer' | 'worker' | 'admin'
  iat: number
  exp: number
}

// Extend Express Request to carry the decoded user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

/** Verifies JWT and attaches decoded payload to req.user */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No token provided'))
  }

  const token = authHeader.slice(7)

  try {
    const redis = getRedisClient()
    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return next(ApiError.unauthorized('Token revoked', 'AUTH_002'))
    }

    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    req.user = payload
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Token expired', 'AUTH_002'))
    }
    return next(ApiError.unauthorized('Invalid token', 'AUTH_002'))
  }
}

/** Role-based authorization — must come after authenticate */
export function authorize(...roles: Array<'customer' | 'worker' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized())
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'))
    }
    next()
  }
}
