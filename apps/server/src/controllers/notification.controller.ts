import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { buildPaginationMeta } from '../utils/pagination'
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/notification.service'

export const NotificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await listMyNotifications(req.user!.sub, req.query)
    return ApiResponse.success(res, {
      message: 'Notifications fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  readAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await markAllNotificationsRead(req.user!.sub)
    return ApiResponse.success(res, { message: 'Notifications marked read', data: result })
  }),

  readOne: asyncHandler(async (req: Request, res: Response) => {
    const result = await markNotificationRead(req.user!.sub, String(req.params.id))
    return ApiResponse.success(res, { message: 'Notification marked read', data: result })
  }),
}
