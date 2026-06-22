import { BookingModel } from '../models/Booking.model'
import { PaymentModel } from '../models/Payment.model'
import { ReviewModel } from '../models/Review.model'
import { UserModel } from '../models/User.model'
import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { ApiError } from '../utils/ApiError'
import { emitBookingUpdate } from '../sockets/socket.service'
import { dispatchNotificationEvent } from './notification.service'

export async function getAdminDashboard() {
  const [users, workers, bookings, payments, reviews, disputedBookings] = await Promise.all([
    UserModel.countDocuments(),
    WorkerProfileModel.countDocuments(),
    BookingModel.countDocuments(),
    PaymentModel.countDocuments({ status: 'captured' }),
    ReviewModel.countDocuments({ isDeleted: false }),
    BookingModel.countDocuments({ status: 'disputed' }),
  ])

  const revenue = await PaymentModel.aggregate([
    { $match: { status: 'captured' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ])

  return {
    users,
    workers,
    bookings,
    capturedPayments: payments,
    reviews,
    disputedBookings,
    revenue: revenue[0]?.total ?? 0,
  }
}

export async function reviewWorkerDocument(
  workerId: string,
  documentId: string,
  status: 'approved' | 'rejected',
) {
  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId: workerId, 'documents._id': documentId },
    { $set: { 'documents.$.status': status } },
    { new: true },
  ).lean()
  if (!profile) throw ApiError.notFound('Worker document')
  await dispatchNotificationEvent(status === 'approved' ? 'worker.approved' : 'worker.rejected', {
    userId: workerId,
    title: status === 'approved' ? 'Worker profile approved' : 'Worker profile rejected',
    message:
      status === 'approved'
        ? 'Your worker profile has been approved. You can now receive jobs.'
        : 'Your worker profile verification was rejected. Please update your documents.',
    type: 'system',
    data: { workerId, documentId, status },
  })
  return profile
}

export async function resolveDispute(bookingId: string, status: 'resolved' | 'rejected') {
  const booking = await BookingModel.findOneAndUpdate(
    { _id: bookingId, status: 'disputed' },
    { $set: { 'dispute.status': status } },
    { new: true },
  ).lean()
  if (!booking) throw ApiError.notFound('Dispute')
  emitBookingUpdate({
    bookingId: booking._id.toString(),
    customerId: booking.customerId.toString(),
    workerId: booking.workerId.toString(),
    status: booking.status,
    booking,
  })
  return booking
}
