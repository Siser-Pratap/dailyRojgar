import type { Server } from 'socket.io'
import { logger } from '../utils/logger'

let io: Server | null = null

export function setSocketServer(server: Server) {
  io = server
}

export function getSocketServer() {
  return io
}

export function userRoom(userId: string) {
  return `user:${userId}`
}

export function chatRoom(bookingId: string) {
  return `chat:${bookingId}`
}

export function emitToUser<T>(userId: string, event: string, payload: T) {
  if (!io) return
  io.of('/notifications').to(userRoom(userId)).emit(event, payload)
}

export function emitNewNotification(userId: string, notification: unknown) {
  emitToUser(userId, 'new_notification', notification)
}

export function emitBookingUpdate(input: {
  bookingId: string
  customerId: string
  workerId: string
  status: string
  booking?: unknown
}) {
  if (!io) return

  const payload = {
    bookingId: input.bookingId,
    status: input.status,
    booking: input.booking,
  }

  io.of('/notifications').to(userRoom(input.customerId)).emit('booking_update', payload)
  io.of('/notifications').to(userRoom(input.workerId)).emit('booking_update', payload)
  io.of('/chat').to(chatRoom(input.bookingId)).emit('booking_update', payload)
}

export function emitWorkerNearby(customerId: string, payload: unknown) {
  emitToUser(customerId, 'worker_nearby', payload)
}

export function logSocketWarning(message: string, meta?: Record<string, unknown>) {
  logger.warn(message, meta)
}
