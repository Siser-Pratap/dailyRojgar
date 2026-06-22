export class ApiError extends Error {
  public readonly statusCode: number
  public readonly errorCode: string
  public readonly details: unknown[]
  public readonly isOperational: boolean

  constructor(statusCode: number, message: string, errorCode: string, details: unknown[] = []) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.details = details
    this.isOperational = true

    // Maintains proper prototype chain in transpiled code
    Object.setPrototypeOf(this, ApiError.prototype)
    Error.captureStackTrace(this, this.constructor)
  }

  // ─── Named constructors for common errors ──────────────────────────────────

  static badRequest(message: string, errorCode = 'BAD_REQUEST', details: unknown[] = []) {
    return new ApiError(400, message, errorCode, details)
  }

  static unauthorized(message = 'Unauthorized', errorCode = 'AUTH_002') {
    return new ApiError(401, message, errorCode)
  }

  static forbidden(message = 'Forbidden', errorCode = 'AUTH_003') {
    return new ApiError(403, message, errorCode)
  }

  static notFound(resource: string, errorCode?: string) {
    return new ApiError(
      404,
      `${resource} not found`,
      errorCode ?? `${resource.toUpperCase().replace(' ', '_')}_NOT_FOUND`,
    )
  }

  static conflict(message: string, errorCode = 'CONFLICT') {
    return new ApiError(409, message, errorCode)
  }

  static unprocessable(message: string, errorCode = 'VALIDATION', details: unknown[] = []) {
    return new ApiError(422, message, errorCode, details)
  }

  static tooManyRequests(message = 'Too many requests', errorCode = 'RATE_LIMIT') {
    return new ApiError(429, message, errorCode)
  }

  static internal(message = 'Internal server error', errorCode = 'INTERNAL') {
    return new ApiError(500, message, errorCode)
  }
}
