import apiClient from '@/lib/axios'

export type ChatMessageType = 'text' | 'image' | 'system'

export interface ChatMessage {
  _id: string
  senderId: string
  text: string
  type: ChatMessageType
  readBy: string[]
  createdAt: string
  /** Present on socket-delivered messages. */
  chatId?: string
  bookingId?: string
}

export interface Chat {
  _id: string
  bookingId: string
  customerId: string
  workerId: string
  participants: string[]
  messages: ChatMessage[]
  lastMessageAt?: string
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

/** Fetches (and lazily creates) the chat + message history for a booking. */
export async function getChatHistory(bookingId: string): Promise<Chat> {
  const { data } = await apiClient.get<ApiEnvelope<Chat>>(`/chats/${bookingId}`)
  return data.data
}
