import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

/**
 * Validates request data against a Zod schema.
 * Throws a ZodError on failure (caught by errorMiddleware).
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(result.error)
      return
    }
    // Replace with parsed (and potentially transformed) data
    req[target] = result.data
    next()
  }
}
