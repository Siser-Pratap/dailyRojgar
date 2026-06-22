import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { buildPaginationMeta } from '../utils/pagination'
import {
  getAdminBookingLedger,
  getAdminDashboard,
  getAdminPaymentLedger,
  getAdminUsers,
  getAdminWorkerDetail,
  getAdminWorkerQueue,
  getDisputeQueue,
  resolveDispute,
  reviewWorkerDocument,
  updateWorkerVerification,
} from '../services/admin.service'

export const AdminController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const result = await getAdminDashboard()
    return ApiResponse.success(res, {
      message: 'Admin dashboard fetched successfully',
      data: result,
    })
  }),

  users: asyncHandler(async (req: Request, res: Response) => {
    const result = await getAdminUsers(req.query)
    return ApiResponse.success(res, {
      message: 'Users fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  workers: asyncHandler(async (req: Request, res: Response) => {
    const result = await getAdminWorkerQueue(req.query)
    return ApiResponse.success(res, {
      message: 'Workers fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  workerDetail: asyncHandler(async (req: Request, res: Response) => {
    const result = await getAdminWorkerDetail(String(req.params.workerId))
    return ApiResponse.success(res, { message: 'Worker fetched successfully', data: result })
  }),

  updateWorkerVerification: asyncHandler(async (req: Request, res: Response) => {
    const result = await updateWorkerVerification(
      String(req.params.workerId),
      req.user!.sub,
      req.body,
    )
    return ApiResponse.success(res, {
      message: 'Worker verification decision saved successfully',
      data: result,
    })
  }),

  reviewDocument: asyncHandler(async (req: Request, res: Response) => {
    const result = await reviewWorkerDocument(
      String(req.params.workerId),
      String(req.params.documentId),
      req.body.status,
      req.user!.sub,
      req.body.rejectionReason,
    )
    return ApiResponse.success(res, {
      message: 'Document decision saved successfully',
      data: result,
    })
  }),

  resolveDispute: asyncHandler(async (req: Request, res: Response) => {
    const result = await resolveDispute(String(req.params.id), req.user!.sub, req.body)
    return ApiResponse.success(res, {
      message: 'Dispute decision saved successfully',
      data: result,
    })
  }),

  bookings: asyncHandler(async (req: Request, res: Response) => {
    const result = await getAdminBookingLedger(req.query)
    return ApiResponse.success(res, {
      message: 'Bookings fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  payments: asyncHandler(async (req: Request, res: Response) => {
    const result = await getAdminPaymentLedger(req.query)
    return ApiResponse.success(res, {
      message: 'Payments fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  disputes: asyncHandler(async (req: Request, res: Response) => {
    const result = await getDisputeQueue(req.query)
    return ApiResponse.success(res, {
      message: 'Disputes fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),
}
