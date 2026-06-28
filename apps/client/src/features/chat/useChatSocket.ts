import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { getChatHistory, type ChatMessage } from './api'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5001'
const TYPING_TIMEOUT = 2500

interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  isError: boolean
  connected: boolean
  /** True when the other participant is typing. */
  peerTyping: boolean
  sendMessage: (text: string) => void
  notifyTyping: () => void
  retry: () => void
}

/**
 * Connects to the `/chat` socket namespace for a booking: loads history over
 * HTTP, then streams live messages + typing. The booking id doubles as the
 * chat id (the server resolves either).
 */
export function useChatSocket(bookingId: string | undefined): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [connected, setConnected] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const peerTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingSentAt = useRef(0)

  const connect = useCallback(() => {
    if (!bookingId) return
    setIsLoading(true)
    setIsError(false)

    let active = true

    getChatHistory(bookingId)
      .then((chat) => {
        if (active) setMessages(chat.messages)
      })
      .catch(() => {
        if (active) setIsError(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    const token = localStorage.getItem('accessToken')
    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_chat', bookingId)
    })
    socket.on('disconnect', () => setConnected(false))

    socket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]))
    })

    socket.on('user_typing', () => {
      setPeerTyping(true)
      if (peerTypingTimer.current) clearTimeout(peerTypingTimer.current)
      peerTypingTimer.current = setTimeout(() => setPeerTyping(false), TYPING_TIMEOUT)
    })
    socket.on('user_stopped_typing', () => setPeerTyping(false))

    return () => {
      active = false
      socket.disconnect()
      socketRef.current = null
      if (peerTypingTimer.current) clearTimeout(peerTypingTimer.current)
    }
  }, [bookingId])

  useEffect(() => connect(), [connect])

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || !socketRef.current || !bookingId) return
      socketRef.current.emit('send_message', { chatId: bookingId, text: trimmed })
      socketRef.current.emit('stop_typing', bookingId)
    },
    [bookingId],
  )

  const notifyTyping = useCallback(() => {
    if (!socketRef.current || !bookingId) return
    // Throttle typing pings to roughly one per second.
    const now = Date.now()
    if (now - typingSentAt.current < 1000) return
    typingSentAt.current = now
    socketRef.current.emit('typing', bookingId)
  }, [bookingId])

  return {
    messages,
    isLoading,
    isError,
    connected,
    peerTyping,
    sendMessage,
    notifyTyping,
    retry: connect,
  }
}
