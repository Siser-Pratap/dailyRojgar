import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { buildPaginationMeta } from '../utils/pagination'
import {
  addWorkerDocument,
  getWorkerJobs,
  getWorkerPublicProfile,
  getWorkerStats,
  listWorkers,
  updateAvailability,
  upsertWorkerProfile,
} from '../services/worker.service'

export const WorkerController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await listWorkers(req.query)
    return ApiResponse.success(res, {
      message: 'Workers fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const result = await getWorkerPublicProfile(String(req.params.id))
    return ApiResponse.success(res, { message: 'Worker fetched successfully', data: result })
  }),

  upsertProfile: asyncHandler(async (req: Request, res: Response) => {
    const result = await upsertWorkerProfile(req.user!.sub, req.body)
    return ApiResponse.success(res, { message: 'Worker profile saved successfully', data: result })
  }),

  availability: asyncHandler(async (req: Request, res: Response) => {
    const result = await updateAvailability(req.user!.sub, req.body.isAvailable)
    return ApiResponse.success(res, { message: 'Availability updated successfully', data: result })
  }),

  documents: asyncHandler(async (req: Request, res: Response) => {
    const result = await addWorkerDocument(req.user!.sub, req.body)
    return ApiResponse.created(res, result, 'Document uploaded successfully')
  }),

  stats: asyncHandler(async (req: Request, res: Response) => {
    const result = await getWorkerStats(req.user!.sub)
    return ApiResponse.success(res, { message: 'Worker stats fetched successfully', data: result })
  }),

  jobs: asyncHandler(async (req: Request, res: Response) => {
    const result = await getWorkerJobs(req.user!.sub, req.query)
    return ApiResponse.success(res, {
      message: 'Worker jobs fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),
}
