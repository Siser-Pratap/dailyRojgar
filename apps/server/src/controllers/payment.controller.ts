import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import {
  createPaymentOrder,
  getPaymentByBooking,
  handlePaymentWebhook,
  refundPayment,
  verifyPayment,
} from '../services/payment.service'

export const PaymentController = {
  createOrder: asyncHandler(async (req: Request, res: Response) => {
    const result = await createPaymentOrder(req.user!.sub, req.body.bookingId)
    return ApiResponse.created(res, result, 'Payment order created successfully')
  }),

  verify: asyncHandler(async (req: Request, res: Response) => {
    const result = await verifyPayment(req.user!.sub, req.body)
    return ApiResponse.success(res, { message: 'Payment verified successfully', data: result })
  }),

  webhook: asyncHandler(async (req: Request, res: Response) => {
    const result = await handlePaymentWebhook(req.body)
    return ApiResponse.success(res, { message: 'Webhook processed successfully', data: result })
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const result = await getPaymentByBooking(
      req.user!.sub,
      req.user!.role,
      String(req.params.bookingId),
    )
    return ApiResponse.success(res, { message: 'Payment fetched successfully', data: result })
  }),

  refund: asyncHandler(async (req: Request, res: Response) => {
    const result = await refundPayment(String(req.params.id), req.body.reason)
    return ApiResponse.success(res, { message: 'Refund initiated successfully', data: result })
  }),
}
