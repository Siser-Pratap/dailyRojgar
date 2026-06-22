import http from 'http'
import jwt from 'jsonwebtoken'
import { Server, Socket } from 'socket.io'
import { env } from '../config/env'
import { JWTPayload } from '../middleware/auth.middleware'
import { ApiError } from '../utils/ApiError'
import { logger } from '../utils/logger'
import {
  markChatMessageRead,
  resolveParticipantChat,
  sendChatMessage,
} from '../services/chat.service'
import { chatRoom, setSocketServer, userRoom } from './socket.service'

type AuthenticatedSocket = Socket & {
  data: Socket['data'] & {
    userId: string
    role: 'customer' | 'worker' | 'admin'
  }
}

function extractToken(socket: Socket) {
  const authToken = socket.handshake.auth?.token
  if (typeof authToken === 'string' && authToken.trim()) return authToken

  const authHeader = socket.handshake.headers.authorization
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  const token = extractToken(socket)
  if (!token) return next(ApiError.unauthorized('No token provided'))

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JWTPayload
    socket.data.userId = payload.sub
    socket.data.role = payload.role
    return next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ApiError.unauthorized('Token expired', 'AUTH_002'))
    }
    return next(ApiError.unauthorized('Invalid token', 'AUTH_002'))
  }
}

function registerNotificationNamespace(io: Server) {
  const notifications = io.of('/notifications')
  notifications.use(authenticateSocket)

  notifications.on('connection', (socket) => {
    const authedSocket = socket as AuthenticatedSocket
    const room = userRoom(authedSocket.data.userId)
    authedSocket.join(room)

    logger.info('Notification socket connected', {
      socketId: authedSocket.id,
      userId: authedSocket.data.userId,
      role: authedSocket.data.role,
    })

    authedSocket.emit('connected', {
      namespace: '/notifications',
      userId: authedSocket.data.userId,
    })
  })
}

function registerChatNamespace(io: Server) {
  const chat = io.of('/chat')
  chat.use(authenticateSocket)

  chat.on('connection', (socket) => {
    const authedSocket = socket as AuthenticatedSocket

    logger.info('Chat socket connected', {
      socketId: authedSocket.id,
      userId: authedSocket.data.userId,
      role: authedSocket.data.role,
    })

    authedSocket.on('join_chat', async (chatId: string, ack?: (payload: unknown) => void) => {
      try {
        const resolvedChat = await resolveParticipantChat(chatId, authedSocket.data.userId)
        const room = chatRoom(resolvedChat.bookingId.toString())
        await authedSocket.join(room)
        const payload = {
          chatId: resolvedChat._id.toString(),
          bookingId: resolvedChat.bookingId.toString(),
          room,
        }
        ack?.({ success: true, data: payload })
        authedSocket.emit('chat_joined', payload)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to join chat'
        ack?.({ success: false, message })
        authedSocket.emit('socket_error', { message })
      }
    })

    authedSocket.on(
      'send_message',
      async (
        payload: { chatId: string; text: string; type?: 'text' | 'image' | 'system' },
        ack?: (payload: unknown) => void,
      ) => {
        try {
          if (!payload?.chatId || !payload?.text?.trim()) {
            throw ApiError.badRequest('chatId and text are required')
          }

          const result = await sendChatMessage({
            chatId: payload.chatId,
            senderId: authedSocket.data.userId,
            text: payload.text.trim(),
            type: payload.type ?? 'text',
          })

          chat.to(chatRoom(result.message.bookingId)).emit('new_message', result.message)
          ack?.({ success: true, data: result.message })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to send message'
          ack?.({ success: false, message })
          authedSocket.emit('socket_error', { message })
        }
      },
    )

    authedSocket.on('typing', async (chatId: string) => {
      try {
        const resolvedChat = await resolveParticipantChat(chatId, authedSocket.data.userId)
        authedSocket.to(chatRoom(resolvedChat.bookingId.toString())).emit('user_typing', {
          chatId: resolvedChat._id.toString(),
          bookingId: resolvedChat.bookingId.toString(),
          userId: authedSocket.data.userId,
        })
      } catch {
        // Do not spam clients for transient typing authorization failures.
      }
    })

    authedSocket.on('stop_typing', async (chatId: string) => {
      try {
        const resolvedChat = await resolveParticipantChat(chatId, authedSocket.data.userId)
        authedSocket.to(chatRoom(resolvedChat.bookingId.toString())).emit('user_stopped_typing', {
          chatId: resolvedChat._id.toString(),
          bookingId: resolvedChat.bookingId.toString(),
          userId: authedSocket.data.userId,
        })
      } catch {
        // Do not spam clients for transient typing authorization failures.
      }
    })

    authedSocket.on(
      'message_read',
      async (payload: { chatId: string; messageId: string }, ack?: (payload: unknown) => void) => {
        try {
          if (!payload?.chatId || !payload?.messageId) {
            throw ApiError.badRequest('chatId and messageId are required')
          }

          const result = await markChatMessageRead({
            chatId: payload.chatId,
            messageId: payload.messageId,
            userId: authedSocket.data.userId,
          })

          chat.to(chatRoom(result.bookingId)).emit('message_read', result)
          ack?.({ success: true, data: result })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to mark message read'
          ack?.({ success: false, message })
          authedSocket.emit('socket_error', { message })
        }
      },
    )
  })
}

export function initSockets(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })

  setSocketServer(io)
  registerChatNamespace(io)
  registerNotificationNamespace(io)

  logger.info('Socket.io initialized', { namespaces: ['/chat', '/notifications'] })
  return io
}
