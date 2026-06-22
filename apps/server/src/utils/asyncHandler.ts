import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async route handler so that any thrown error is forwarded
 * to Express's next(error) — no try/catch boilerplate needed in controllers.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
