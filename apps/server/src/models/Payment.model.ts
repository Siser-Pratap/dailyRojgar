import mongoose, { Schema, Types } from 'mongoose'

export type PaymentStatus =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refund_initiated'
  | 'refunded'

export interface PaymentDocument {
  bookingId: Types.ObjectId
  customerId: Types.ObjectId
  workerId: Types.ObjectId
  amount: number
  baseAmount: number
  platformFee: number
  workerPayout: number
  currency: string
  status: PaymentStatus
  provider: 'razorpay'
  providerOrderId: string
  providerPaymentId?: string
  providerSignature?: string
  refundId?: string
  refundAmount?: number
  refundReason?: string
  capturedAt?: Date
  refundedAt?: Date
  rawWebhookEvents: unknown[]
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    baseAmount: { type: Number, required: true, min: 0 },
    platformFee: { type: Number, required: true, min: 0 },
    workerPayout: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refund_initiated', 'refunded'],
      default: 'created',
      index: true,
    },
    provider: { type: String, enum: ['razorpay'], default: 'razorpay' },
    providerOrderId: { type: String, required: true, unique: true, index: true },
    providerPaymentId: { type: String, index: true },
    providerSignature: String,
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    capturedAt: Date,
    refundedAt: Date,
    rawWebhookEvents: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, versionKey: false },
)

export const PaymentModel = mongoose.model<PaymentDocument>('Payment', paymentSchema)
