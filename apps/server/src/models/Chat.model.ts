import mongoose, { Schema, Types } from 'mongoose'

export type ChatMessageType = 'text' | 'image' | 'system'

export interface ChatMessageDocument {
  _id: Types.ObjectId
  senderId: Types.ObjectId
  text: string
  type: ChatMessageType
  readBy: Types.ObjectId[]
  createdAt: Date
}

export interface ChatDocument {
  bookingId: Types.ObjectId
  customerId: Types.ObjectId
  workerId: Types.ObjectId
  participants: Types.ObjectId[]
  messages: ChatMessageDocument[]
  lastMessageAt?: Date
}

const chatMessageSchema = new Schema<ChatMessageDocument>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
)

const chatSchema = new Schema<ChatDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [chatMessageSchema],
    lastMessageAt: Date,
  },
  { timestamps: true, versionKey: false },
)

chatSchema.index({ participants: 1, lastMessageAt: -1 })

export const ChatModel = mongoose.model<ChatDocument>('Chat', chatSchema)
