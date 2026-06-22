import mongoose, { Schema, Types } from 'mongoose'

export interface NotificationDocument {
  userId: Types.ObjectId
  title: string
  message: string
  type: 'booking' | 'payment' | 'review' | 'system'
  data?: Record<string, unknown>
  readAt?: Date | null
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: ['booking', 'payment', 'review', 'system'], default: 'system' },
    data: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, versionKey: false },
)

notificationSchema.index({ userId: 1, createdAt: -1 })

export const NotificationModel = mongoose.model<NotificationDocument>(
  'Notification',
  notificationSchema,
)
