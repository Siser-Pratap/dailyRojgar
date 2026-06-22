import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { getAdminDashboard, resolveDispute, reviewWorkerDocument } from '../services/admin.service'

export const AdminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const result = await getAdminDashboard()
    return ApiResponse.success(res, {
      message: 'Admin dashboard fetched successfully',
      data: result,
    })
  }),

  reviewDocument: asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewWorkerDocument(
      String(req.params.workerId),
      String(req.params.documentId),
      req.body.status,
    )
    return ApiResponse.success(res, {
      message: 'Document decision saved successfully',
      data: result,
    })
  }),

  resolveDispute: asyncHandler(async (req: Request, res: Response) => {
    const result = await resolveDispute(String(req.params.id), req.body.status)
    return ApiResponse.success(res, {
      message: 'Dispute decision saved successfully',
      data: result,
    })
  }),
}
