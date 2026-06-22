import { Types } from 'mongoose'
import { ChatModel } from '../models/Chat.model'
import { BookingModel } from '../models/Booking.model'
import { getRedisClient } from '../config/redis'
import { ApiError } from '../utils/ApiError'

export async function createChatForBooking(input: {
  bookingId: string
  customerId: string
  workerId: string
}) {
  return ChatModel.findOneAndUpdate(
    { bookingId: input.bookingId },
    {
      $setOnInsert: {
        bookingId: input.bookingId,
        customerId: input.customerId,
        workerId: input.workerId,
        participants: [input.customerId, input.workerId],
      },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean()
}

export async function resolveParticipantChat(chatIdOrBookingId: string, userId: string) {
  let chat = await ChatModel.findOne({ bookingId: chatIdOrBookingId }).lean()
  if (!chat && Types.ObjectId.isValid(chatIdOrBookingId)) {
    chat = await ChatModel.findById(chatIdOrBookingId).lean()
  }

  if (!chat) {
    const booking = await BookingModel.findById(chatIdOrBookingId).lean()
    if (!booking) throw ApiError.notFound('Chat')
    chat = await createChatForBooking({
      bookingId: booking._id.toString(),
      customerId: booking.customerId.toString(),
      workerId: booking.workerId.toString(),
    })
  }

  const participantIds = chat.participants.map((participantId) => participantId.toString())
  if (!participantIds.includes(userId)) {
    throw ApiError.forbidden('You do not have access to this chat')
  }

  return chat
}

export async function sendChatMessage(input: {
  chatId: string
  senderId: string
  text: string
  type?: 'text' | 'image' | 'system'
}) {
  const chat = await resolveParticipantChat(input.chatId, input.senderId)
  const messageId = new Types.ObjectId()
  const message = {
    _id: messageId,
    senderId: new Types.ObjectId(input.senderId),
    text: input.text,
    type: input.type ?? 'text',
    readBy: [new Types.ObjectId(input.senderId)],
    createdAt: new Date(),
  }

  const updated = await ChatModel.findByIdAndUpdate(
    chat._id,
    {
      $push: { messages: message },
      $set: { lastMessageAt: message.createdAt },
    },
    { new: true },
  ).lean()
  if (!updated) throw ApiError.notFound('Chat')

  const recipientIds = updated.participants
    .map((participantId) => participantId.toString())
    .filter((participantId) => participantId !== input.senderId)

  const redis = getRedisClient()
  await Promise.all(
    recipientIds.map((recipientId) =>
      redis.incr(`unread:${recipientId}:${updated._id.toString()}`),
    ),
  )

  return {
    chat: updated,
    message: {
      ...message,
      _id: messageId.toString(),
      senderId: input.senderId,
      readBy: [input.senderId],
      chatId: updated._id.toString(),
      bookingId: updated.bookingId.toString(),
    },
  }
}

export async function markChatMessageRead(input: {
  chatId: string
  messageId: string
  userId: string
}) {
  const chat = await resolveParticipantChat(input.chatId, input.userId)
  const updated = await ChatModel.findOneAndUpdate(
    { _id: chat._id, 'messages._id': input.messageId },
    { $addToSet: { 'messages.$.readBy': new Types.ObjectId(input.userId) } },
    { new: true },
  ).lean()
  if (!updated) throw ApiError.notFound('Message')

  const redis = getRedisClient()
  await redis.del(`unread:${input.userId}:${updated._id.toString()}`)

  const message = updated.messages.find((item) => item._id.toString() === input.messageId)
  return {
    chatId: updated._id.toString(),
    bookingId: updated.bookingId.toString(),
    messageId: input.messageId,
    readBy: message?.readBy.map((userId) => userId.toString()) ?? [],
  }
}
