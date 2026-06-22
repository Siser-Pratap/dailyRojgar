import mongoose, { Schema, Types } from 'mongoose'

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type BookingPaymentStatus =
  | 'unpaid'
  | 'created'
  | 'paid'
  | 'failed'
  | 'refund_initiated'
  | 'refunded'

export interface BookingDocument {
  bookingNumber: string
  customerId: Types.ObjectId
  workerId: Types.ObjectId
  workerProfileId?: Types.ObjectId
  categoryId: string
  scheduledDate: Date
  durationDays: number
  address: {
    street?: string
    city?: string
    state?: string
    pincode?: string
  }
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
  description?: string
  amount: number
  platformFee: number
  totalAmount: number
  paymentStatus: BookingPaymentStatus
  paymentId?: Types.ObjectId
  status: BookingStatus
  statusHistory: Array<{ status: BookingStatus; by: Types.ObjectId; at: Date; reason?: string }>
  dispute?: { reason: string; raisedAt: Date; status: 'open' | 'resolved' | 'rejected' }
  startedAt?: Date
  completedAt?: Date
  cancelledAt?: Date
}

const bookingSchema = new Schema<BookingDocument>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerProfileId: { type: Schema.Types.ObjectId, ref: 'WorkerProfile' },
    categoryId: { type: String, required: true, trim: true, index: true },
    scheduledDate: { type: Date, required: true },
    durationDays: { type: Number, default: 1, min: 1 },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    description: { type: String, trim: true, maxlength: 2000 },
    amount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'created', 'paid', 'failed', 'refund_initiated', 'refunded'],
      default: 'unpaid',
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'in_progress',
        'completed',
        'cancelled',
        'disputed',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: [
            'pending',
            'accepted',
            'rejected',
            'in_progress',
            'completed',
            'cancelled',
            'disputed',
          ],
          required: true,
        },
        by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        at: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    dispute: {
      reason: String,
      raisedAt: Date,
      status: { type: String, enum: ['open', 'resolved', 'rejected'] },
    },
    startedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true, versionKey: false },
)

bookingSchema.index({ location: '2dsphere' })
bookingSchema.index({ customerId: 1, status: 1 })
bookingSchema.index({ workerId: 1, status: 1 })

export const BookingModel = mongoose.model<BookingDocument>('Booking', bookingSchema)
