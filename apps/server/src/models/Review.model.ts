import mongoose, { Schema, Types } from 'mongoose'

export interface ReviewDocument {
  bookingId: Types.ObjectId
  customerId: Types.ObjectId
  workerId: Types.ObjectId
  rating: number
  comment?: string
  reply?: { text: string; repliedAt: Date }
  isDeleted: boolean
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000 },
    reply: {
      text: { type: String, trim: true, maxlength: 1000 },
      repliedAt: Date,
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, versionKey: false },
)

export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema)
