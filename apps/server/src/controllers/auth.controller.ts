import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../services/auth.service'

export const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await registerUser(req.body)
    return ApiResponse.created(res, result, 'User registered successfully')
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await loginUser(req.body)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Login successful',
      data: result,
    })
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await refreshAccessToken(req.body)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: result,
    })
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'Logout successful',
      })
    }

    await logoutUser(req.user.sub)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Logout successful',
    })
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return ApiResponse.success(res, {
        statusCode: 200,
        message: 'User not found',
        data: null,
      })
    }

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'User fetched successfully',
      data: { user: req.user },
    })
  }),
}
