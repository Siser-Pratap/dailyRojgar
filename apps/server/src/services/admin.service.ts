import { BookingModel } from '../models/Booking.model'
import { PaymentModel } from '../models/Payment.model'
import { ReviewModel } from '../models/Review.model'
import { UserModel } from '../models/User.model'
import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { ApiError } from '../utils/ApiError'
import { parsePagination } from '../utils/pagination'
import { emitBookingUpdate } from '../sockets/socket.service'
import { dispatchNotificationEvent } from './notification.service'
import { createRazorpayRefund } from './razorpay.service'

interface AdminListQuery {
  q?: string
  role?: 'customer' | 'worker' | 'admin'
  status?: string
  page?: number
  limit?: number
}

interface WorkerVerificationDecision {
  status: 'approved' | 'rejected'
  rejectionReason?: string
}

interface DisputeDecision {
  resolution: 'customer' | 'worker' | 'partial'
  refundAmount?: number
  notes?: string
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function buildTextFilter(q?: string) {
  if (!q) return {}
  return {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
    ],
  }
}

export async function getAdminDashboard() {
  const today = startOfToday()
  const [
    users,
    newToday,
    workers,
    activeWorkers,
    bookings,
    bookingsToday,
    payments,
    reviews,
    pendingDisputes,
    pendingVerifications,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ createdAt: { $gte: today } }),
    WorkerProfileModel.countDocuments(),
    WorkerProfileModel.countDocuments({ verificationStatus: 'approved', isAvailable: true }),
    BookingModel.countDocuments(),
    BookingModel.countDocuments({ scheduledDate: { $gte: today } }),
    PaymentModel.countDocuments({ status: 'captured' }),
    ReviewModel.countDocuments({ isDeleted: false }),
    BookingModel.countDocuments({ status: 'disputed' }),
    WorkerProfileModel.countDocuments({ verificationStatus: 'under_review' }),
  ])

  const [revenue, revenueToday] = await Promise.all([
    PaymentModel.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    PaymentModel.aggregate([
      { $match: { status: 'captured', capturedAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ])

  return {
    users,
    newToday,
    workers,
    activeWorkers,
    bookings,
    bookingsToday,
    capturedPayments: payments,
    reviews,
    pendingDisputes,
    pendingVerifications,
    revenue: revenue[0]?.total ?? 0,
    revenueToday: revenueToday[0]?.total ?? 0,
  }
}

export async function getAdminUsers(query: AdminListQuery) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = buildTextFilter(query.q)
  if (query.role) filter.role = query.role
  if (query.status === 'active') filter.isActive = true
  if (query.status === 'inactive') filter.isActive = false

  const [items, total] = await Promise.all([
    UserModel.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    UserModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function getAdminWorkerQueue(query: AdminListQuery) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = {}
  if (query.status) filter.verificationStatus = query.status

  const [items, total] = await Promise.all([
    WorkerProfileModel.find(filter)
      .populate('userId', 'name email phone profileImage isActive')
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    WorkerProfileModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function getAdminWorkerDetail(workerId: string) {
  const profile = await WorkerProfileModel.findOne({ userId: workerId })
    .populate('userId', 'name email phone profileImage address isActive isVerified')
    .lean()
  if (!profile) throw ApiError.notFound('Worker profile')

  const [bookings, payments, reviews] = await Promise.all([
    BookingModel.find({ workerId }).sort({ createdAt: -1 }).limit(10).lean(),
    PaymentModel.find({ workerId }).sort({ createdAt: -1 }).limit(10).lean(),
    ReviewModel.find({ workerId, isDeleted: false }).sort({ createdAt: -1 }).limit(10).lean(),
  ])

  return { profile, bookings, payments, reviews }
}

export async function updateWorkerVerification(
  workerId: string,
  adminId: string,
  decision: WorkerVerificationDecision,
) {
  const update =
    decision.status === 'approved'
      ? {
          verificationStatus: 'approved',
          rejectionReason: undefined,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          isAvailable: true,
        }
      : {
          verificationStatus: 'rejected',
          rejectionReason: decision.rejectionReason ?? 'Verification rejected by admin',
          reviewedAt: new Date(),
          reviewedBy: adminId,
          isAvailable: false,
        }

  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId: workerId },
    { $set: update },
    { new: true },
  ).lean()
  if (!profile) throw ApiError.notFound('Worker profile')

  await dispatchNotificationEvent(
    decision.status === 'approved' ? 'worker.approved' : 'worker.rejected',
    {
      userId: workerId,
      title: decision.status === 'approved' ? 'Worker profile approved' : 'Worker profile rejected',
      message:
        decision.status === 'approved'
          ? 'Your worker profile has been approved. You can now receive jobs.'
          : `Your worker profile verification was rejected. Reason: ${update.rejectionReason}`,
      type: 'system',
      data: { workerId, status: decision.status, rejectionReason: update.rejectionReason },
    },
  )

  return profile
}

export async function reviewWorkerDocument(
  workerId: string,
  documentId: string,
  status: 'approved' | 'rejected',
  adminId: string,
  rejectionReason?: string,
) {
  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId: workerId, 'documents._id': documentId },
    {
      $set: {
        'documents.$.status': status,
        ...(status === 'rejected'
          ? {
              verificationStatus: 'rejected',
              rejectionReason,
              reviewedAt: new Date(),
              reviewedBy: adminId,
            }
          : { verificationStatus: 'under_review' }),
      },
    },
    { new: true },
  ).lean()
  if (!profile) throw ApiError.notFound('Worker document')

  if (status === 'rejected') {
    await dispatchNotificationEvent('worker.rejected', {
      userId: workerId,
      title: 'Worker document rejected',
      message: `One of your verification documents was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      type: 'system',
      data: { workerId, documentId, status, rejectionReason },
    })
  }

  return profile
}

export async function getAdminBookingLedger(query: AdminListQuery) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = {}
  if (query.status) filter.status = query.status

  const [items, total] = await Promise.all([
    BookingModel.find(filter)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    BookingModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function getAdminPaymentLedger(query: AdminListQuery) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = {}
  if (query.status) filter.status = query.status

  const [items, total] = await Promise.all([
    PaymentModel.find(filter)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    PaymentModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function getDisputeQueue(query: AdminListQuery) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = { status: 'disputed' }
  if (query.status === 'resolved') filter['dispute.status'] = 'resolved'
  if (query.status === 'open') filter['dispute.status'] = 'open'

  const [items, total] = await Promise.all([
    BookingModel.find(filter)
      .populate('customerId', 'name email phone')
      .populate('workerId', 'name email phone')
      .sort({ updatedAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    BookingModel.countDocuments(filter),
  ])
  return { items, total, ...pagination }
}

export async function resolveDispute(
  bookingId: string,
  adminId: string,
  decision: DisputeDecision,
) {
  const booking = await BookingModel.findOne({ _id: bookingId, status: 'disputed' })
  if (!booking) throw ApiError.notFound('Dispute')

  let refund: unknown = null
  if (decision.resolution === 'customer' || decision.resolution === 'partial') {
    const payment = await PaymentModel.findOne({ bookingId, status: 'captured' })
    if (!payment?.providerPaymentId) {
      throw ApiError.badRequest('Captured payment is required before refunding dispute')
    }

    const refundAmount = decision.resolution === 'partial' ? decision.refundAmount : payment.amount
    if (!refundAmount || refundAmount <= 0 || refundAmount > payment.amount) {
      throw ApiError.badRequest('Invalid refund amount')
    }

    refund = await createRazorpayRefund({
      paymentId: payment.providerPaymentId,
      amountInRupees: refundAmount,
      notes: {
        bookingId,
        paymentId: payment._id.toString(),
        reason: `dispute_${decision.resolution}`,
      },
    })

    payment.status = refundAmount === payment.amount ? 'refund_initiated' : payment.status
    payment.refundId = (refund as { id?: string }).id
    payment.refundAmount = refundAmount
    payment.refundReason = decision.notes ?? `Dispute resolved for ${decision.resolution}`
    payment.rawWebhookEvents.push({
      type: 'admin_dispute_refund',
      refund,
      decision,
      adminId,
      at: new Date().toISOString(),
    })
    await payment.save()

    booking.paymentStatus =
      refundAmount === payment.amount ? 'refund_initiated' : booking.paymentStatus
  }

  booking.dispute = {
    reason: booking.dispute?.reason ?? decision.notes ?? 'Admin dispute resolution',
    raisedAt: booking.dispute?.raisedAt ?? new Date(),
    status: 'resolved',
  }
  booking.statusHistory.push({
    status: 'disputed',
    by: adminId as never,
    at: new Date(),
    reason: `Admin resolved for ${decision.resolution}${decision.notes ? `: ${decision.notes}` : ''}`,
  })
  await booking.save()

  emitBookingUpdate({
    bookingId: booking._id.toString(),
    customerId: booking.customerId.toString(),
    workerId: booking.workerId.toString(),
    status: booking.status,
    booking: booking.toObject(),
  })

  await Promise.all([
    dispatchNotificationEvent('system.notification', {
      userId: booking.customerId,
      title: 'Dispute resolved',
      message: `Your dispute has been resolved for ${decision.resolution}.${decision.notes ? ` ${decision.notes}` : ''}`,
      type: 'booking',
      data: { bookingId, resolution: decision.resolution, refund },
    }),
    dispatchNotificationEvent('system.notification', {
      userId: booking.workerId,
      title: 'Dispute resolved',
      message: `A dispute on booking ${booking.bookingNumber} has been resolved for ${decision.resolution}.`,
      type: 'booking',
      data: { bookingId, resolution: decision.resolution, refund },
    }),
  ])

  return { booking: booking.toObject(), refund }
}
