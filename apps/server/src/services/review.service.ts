import { Types } from 'mongoose'
import { BookingModel } from '../models/Booking.model'
import { ReviewModel } from '../models/Review.model'
import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { ApiError } from '../utils/ApiError'
import { createNotification } from './notification.service'

async function recalculateWorkerRating(workerId: string) {
  const stats = await ReviewModel.aggregate([
    { $match: { workerId: new Types.ObjectId(workerId), isDeleted: false } },
    { $group: { _id: '$workerId', average: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ])
  const rating = stats[0]
    ? { average: Number(stats[0].average.toFixed(2)), totalReviews: stats[0].totalReviews }
    : { average: 0, totalReviews: 0 }
  await WorkerProfileModel.findOneAndUpdate({ userId: workerId }, { $set: { rating } })
}

export async function createReview(
  customerId: string,
  input: { bookingId: string; rating: number; comment?: string },
) {
  const booking = await BookingModel.findById(input.bookingId).lean()
  if (!booking) throw ApiError.notFound('Booking')
  if (String(booking.customerId) !== customerId)
    throw ApiError.forbidden('Only customer can review')
  if (booking.status !== 'completed')
    throw ApiError.badRequest('Only completed bookings can be reviewed')

  const review = await ReviewModel.create({
    bookingId: input.bookingId,
    customerId,
    workerId: booking.workerId,
    rating: input.rating,
    comment: input.comment,
  })
  await recalculateWorkerRating(String(booking.workerId))
  await createNotification({
    userId: booking.workerId,
    title: 'New review received',
    message: `You received a ${input.rating}-star review`,
    type: 'review',
    data: { reviewId: review._id.toString(), bookingId: input.bookingId },
  })
  return review.toObject()
}

export async function listWorkerReviews(workerId: string) {
  return ReviewModel.find({ workerId, isDeleted: false }).sort({ createdAt: -1 }).lean()
}

export async function replyToReview(workerId: string, reviewId: string, text: string) {
  const review = await ReviewModel.findOneAndUpdate(
    { _id: reviewId, workerId, isDeleted: false },
    { $set: { reply: { text, repliedAt: new Date() } } },
    { new: true },
  ).lean()
  if (!review) throw ApiError.notFound('Review')
  return review
}

export async function deleteReview(reviewId: string) {
  const review = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { $set: { isDeleted: true } },
    { new: true },
  ).lean()
  if (!review) throw ApiError.notFound('Review')
  await recalculateWorkerRating(String(review.workerId))
  return review
}
