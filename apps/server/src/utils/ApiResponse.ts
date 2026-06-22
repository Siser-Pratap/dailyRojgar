import { Response } from 'express'

interface SuccessMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export class ApiResponse {
  static success<T>(
    res: Response,
    {
      statusCode = 200,
      message = 'Success',
      data,
      meta,
    }: {
      statusCode?: number
      message?: string
      data?: T
      meta?: SuccessMeta
    } = {},
  ): Response {
    const body: Record<string, unknown> = { success: true, message }
    if (data !== undefined) {
      body.data = data
    }
    if (meta) {
      body.meta = meta
    }
    return res.status(statusCode).json(body)
  }

  static created<T>(res: Response, data?: T, message = 'Created successfully'): Response {
    return ApiResponse.success(res, { statusCode: 201, message, data })
  }

  static noContent(res: Response): Response {
    return res.status(204).send()
  }
}
