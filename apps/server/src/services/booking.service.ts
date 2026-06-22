import { Types } from 'mongoose'
import { BookingModel, BookingStatus } from '../models/Booking.model'
import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { PLATFORM_FEE_PERCENT, DISPUTE_WINDOW_AFTER_COMPLETION_HOURS } from '../config/constants'
import { generateBookingNumber } from '../utils/bookingNumber'
import { ApiError } from '../utils/ApiError'
import { parsePagination } from '../utils/pagination'
import { createNotification } from './notification.service'
import { createChatForBooking } from './chat.service'
import { emitBookingUpdate } from '../sockets/socket.service'

function ensureOwner(actualId: unknown, expectedId: string, message = 'Not allowed') {
  if (String(actualId) !== expectedId) throw ApiError.forbidden(message)
}

async function transitionBooking(
  bookingId: string,
  userId: string,
  nextStatus: BookingStatus,
  allowedFrom: BookingStatus[],
  options: { reason?: string; requireWorker?: boolean; requireCustomer?: boolean } = {},
) {
  const booking = await BookingModel.findById(bookingId)
  if (!booking) throw ApiError.notFound('Booking')
  if (!allowedFrom.includes(booking.status)) {
    throw ApiError.badRequest(`Cannot change booking from ${booking.status} to ${nextStatus}`)
  }
  if (options.requireWorker) ensureOwner(booking.workerId, userId)
  if (options.requireCustomer) ensureOwner(booking.customerId, userId)

  booking.status = nextStatus
  booking.statusHistory.push({
    status: nextStatus,
    by: new Types.ObjectId(userId),
    at: new Date(),
    reason: options.reason,
  })
  if (nextStatus === 'in_progress') booking.startedAt = new Date()
  if (nextStatus === 'completed') booking.completedAt = new Date()
  if (nextStatus === 'cancelled') booking.cancelledAt = new Date()
  await booking.save()

  emitBookingUpdate({
    bookingId: booking._id.toString(),
    customerId: booking.customerId.toString(),
    workerId: booking.workerId.toString(),
    status: nextStatus,
    booking: booking.toObject(),
  })

  await createNotification({
    userId: options.requireWorker ? booking.customerId : booking.workerId,
    title: 'Booking updated',
    message: `Booking ${booking.bookingNumber} is now ${nextStatus.replace('_', ' ')}`,
    type: 'booking',
    data: { bookingId: booking._id.toString(), status: nextStatus },
  })

  return booking.toObject()
}

export async function createBooking(
  customerId: string,
  input: {
    workerId: string
    workerProfileId?: string
    categoryId: string
    scheduledDate: Date
    durationDays: number
    address?: Record<string, string>
    location?: { lat: number; lng: number }
    description?: string
    amount: number
  },
) {
  if (customerId === input.workerId) throw ApiError.badRequest('Cannot book yourself')

  const workerProfile = await WorkerProfileModel.findOne({
    ...(input.workerProfileId ? { _id: input.workerProfileId } : { userId: input.workerId }),
    userId: input.workerId,
  }).lean()
  if (!workerProfile) throw ApiError.notFound('Worker profile')
  if (!workerProfile.isAvailable) throw ApiError.badRequest('Worker is not available')

  const platformFee = Math.round((input.amount * PLATFORM_FEE_PERCENT) / 100)
  const totalAmount = input.amount + platformFee
  const booking = await BookingModel.create({
    bookingNumber: generateBookingNumber(),
    customerId,
    workerId: input.workerId,
    workerProfileId: workerProfile._id,
    categoryId: input.categoryId,
    scheduledDate: input.scheduledDate,
    durationDays: input.durationDays,
    address: input.address ?? {},
    location: input.location
      ? { type: 'Point', coordinates: [input.location.lng, input.location.lat] }
      : workerProfile.location,
    description: input.description,
    amount: input.amount,
    platformFee,
    totalAmount,
    statusHistory: [{ status: 'pending', by: new Types.ObjectId(customerId), at: new Date() }],
  })

  await createChatForBooking({
    bookingId: booking._id.toString(),
    customerId,
    workerId: input.workerId,
  })

  emitBookingUpdate({
    bookingId: booking._id.toString(),
    customerId,
    workerId: input.workerId,
    status: booking.status,
    booking: booking.toObject(),
  })

  await createNotification({
    userId: input.workerId,
    title: 'New booking request',
    message: `You received booking ${booking.bookingNumber}`,
    type: 'booking',
    data: { bookingId: booking._id.toString(), status: booking.status },
  })

  return booking.toObject()
}

export async function listMyBookings(
  userId: string,
  role: string,
  query: { status?: BookingStatus; page?: number; limit?: number },
) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> =
    role === 'worker' ? { workerId: userId } : { customerId: userId }
  if (query.status) filter.status = query.status

  const [items, total] = await Promise.all([
    BookingModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    BookingModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function getBookingDetail(userId: string, role: string, bookingId: string) {
  const booking = await BookingModel.findById(bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')
  if (
    role !== 'admin' &&
    String(booking.customerId) !== userId &&
    String(booking.workerId) !== userId
  ) {
    throw ApiError.forbidden('You do not have access to this booking')
  }
  return booking
}

export const acceptBooking = (bookingId: string, workerId: string) =>
  transitionBooking(bookingId, workerId, 'accepted', ['pending'], { requireWorker: true })

export const rejectBooking = (bookingId: string, workerId: string, reason?: string) =>
  transitionBooking(bookingId, workerId, 'rejected', ['pending'], { requireWorker: true, reason })

export const startBooking = (bookingId: string, workerId: string) =>
  transitionBooking(bookingId, workerId, 'in_progress', ['accepted'], { requireWorker: true })

export async function completeBooking(bookingId: string, workerId: string) {
  const booking = await transitionBooking(bookingId, workerId, 'completed', ['in_progress'], {
    requireWorker: true,
  })
  await WorkerProfileModel.findOneAndUpdate(
    { userId: workerId },
    { $inc: { totalJobs: 1, totalEarnings: booking.amount } },
  )
  return booking
}

export async function cancelBooking(bookingId: string, userId: string, reason?: string) {
  const booking = await BookingModel.findById(bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')
  if (String(booking.customerId) !== userId && String(booking.workerId) !== userId) {
    throw ApiError.forbidden('You cannot cancel this booking')
  }
  return transitionBooking(bookingId, userId, 'cancelled', ['pending', 'accepted'], { reason })
}

export async function disputeBooking(bookingId: string, customerId: string, reason: string) {
  const booking = await BookingModel.findById(bookingId)
  if (!booking) throw ApiError.notFound('Booking')
  ensureOwner(booking.customerId, customerId)
  if (booking.status !== 'completed' || !booking.completedAt) {
    throw ApiError.badRequest('Only completed bookings can be disputed')
  }
  const windowMs = DISPUTE_WINDOW_AFTER_COMPLETION_HOURS * 60 * 60 * 1000
  if (Date.now() - booking.completedAt.getTime() > windowMs) {
    throw ApiError.badRequest('Dispute window has expired')
  }

  booking.status = 'disputed'
  booking.dispute = { reason, raisedAt: new Date(), status: 'open' }
  booking.statusHistory.push({
    status: 'disputed',
    by: new Types.ObjectId(customerId),
    at: new Date(),
    reason,
  })
  await booking.save()

  emitBookingUpdate({
    bookingId: booking._id.toString(),
    customerId: booking.customerId.toString(),
    workerId: booking.workerId.toString(),
    status: 'disputed',
    booking: booking.toObject(),
  })

  await createNotification({
    userId: booking.workerId,
    title: 'Booking disputed',
    message: `Booking ${booking.bookingNumber} was disputed`,
    type: 'booking',
    data: { bookingId: booking._id.toString(), status: 'disputed' },
  })
  return booking.toObject()
}
