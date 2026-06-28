import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import {
  forgotPassword,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendOtp,
  resetPassword,
  updateUserProfile,
  verifyOtp,
} from '../services/auth.service'

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

    const accessToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined
    await logoutUser(req.user.sub, accessToken)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Logout successful',
    })
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyOtp(req.body)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'OTP verified successfully',
      data: result,
    })
  }),

  resendOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await resendOtp(req.body.phone)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'OTP resent successfully',
      data: result,
    })
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await forgotPassword(req.body.email)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Password reset instructions sent successfully',
      data: result,
    })
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await resetPassword(req.body)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Password reset successfully',
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

    const user = await getUserProfile(req.user.sub)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'User fetched successfully',
      data: { user },
    })
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await updateUserProfile(req.user!.sub, req.body)
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { user },
    })
  }),
}
