import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { buildPaginationMeta } from '../utils/pagination'
import {
  acceptBooking,
  cancelBooking,
  completeBooking,
  createBooking,
  disputeBooking,
  getBookingDetail,
  listMyBookings,
  rejectBooking,
  startBooking,
} from '../services/booking.service'

export const BookingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await createBooking(req.user!.sub, req.body)
    return ApiResponse.created(res, result, 'Booking created successfully')
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await listMyBookings(req.user!.sub, req.user!.role, req.query)
    return ApiResponse.success(res, {
      message: 'Bookings fetched successfully',
      data: result.items,
      meta: buildPaginationMeta(result.total, result),
    })
  }),

  detail: asyncHandler(async (req: Request, res: Response) => {
    const result = await getBookingDetail(req.user!.sub, req.user!.role, String(req.params.id))
    return ApiResponse.success(res, { message: 'Booking fetched successfully', data: result })
  }),

  accept: asyncHandler(async (req: Request, res: Response) => {
    const result = await acceptBooking(String(req.params.id), req.user!.sub)
    return ApiResponse.success(res, { message: 'Booking accepted successfully', data: result })
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const result = await rejectBooking(String(req.params.id), req.user!.sub, req.body.reason)
    return ApiResponse.success(res, { message: 'Booking rejected successfully', data: result })
  }),

  start: asyncHandler(async (req: Request, res: Response) => {
    const result = await startBooking(String(req.params.id), req.user!.sub)
    return ApiResponse.success(res, { message: 'Booking started successfully', data: result })
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const result = await completeBooking(String(req.params.id), req.user!.sub)
    return ApiResponse.success(res, { message: 'Booking completed successfully', data: result })
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const result = await cancelBooking(String(req.params.id), req.user!.sub, req.body.reason)
    return ApiResponse.success(res, { message: 'Booking cancelled successfully', data: result })
  }),

  dispute: asyncHandler(async (req: Request, res: Response) => {
    const result = await disputeBooking(String(req.params.id), req.user!.sub, req.body.reason)
    return ApiResponse.success(res, { message: 'Dispute raised successfully', data: result })
  }),
}
