import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import {
  createReview,
  deleteReview,
  listWorkerReviews,
  replyToReview,
} from '../services/review.service'

export const ReviewController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await createReview(req.user!.sub, req.body)
    return ApiResponse.created(res, result, 'Review submitted successfully')
  }),

  workerReviews: asyncHandler(async (req: Request, res: Response) => {
    const result = await listWorkerReviews(String(req.params.workerId))
    return ApiResponse.success(res, { message: 'Reviews fetched successfully', data: result })
  }),

  reply: asyncHandler(async (req: Request, res: Response) => {
    const result = await replyToReview(req.user!.sub, String(req.params.id), req.body.text)
    return ApiResponse.success(res, { message: 'Review reply saved successfully', data: result })
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await deleteReview(String(req.params.id))
    return ApiResponse.success(res, { message: 'Review removed successfully', data: result })
  }),
}
