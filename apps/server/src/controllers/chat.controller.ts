import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { resolveParticipantChat } from '../services/chat.service'

export const ChatController = {
  // Returns (and lazily creates) the chat for a booking, with full message
  // history. Access is restricted to the booking's participants.
  byBooking: asyncHandler(async (req: Request, res: Response) => {
    const chat = await resolveParticipantChat(String(req.params.bookingId), req.user!.sub)
    return ApiResponse.success(res, { message: 'Chat fetched successfully', data: chat })
  }),
}
