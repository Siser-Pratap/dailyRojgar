import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, PageSpinner } from '@/components/ui'
import { ErrorState } from '@/components/feedback'
import { useAuth } from '@/hooks/useAuth'
import { cn, formatDate } from '@/lib/utils'
import { useChatSocket } from '../useChatSocket'

export default function ChatPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, isError, connected, peerTyping, sendMessage, notifyTyping, retry } =
    useChatSocket(bookingId)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, peerTyping])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <DashboardLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950">Booking chat</h1>
        <span
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium',
            connected ? 'text-primary-700' : 'text-gray-400',
          )}
        >
          <span
            className={cn('h-2 w-2 rounded-full', connected ? 'bg-primary-500' : 'bg-gray-300')}
          />
          {connected ? 'Connected' : 'Connecting…'}
        </span>
      </div>

      <Card className="flex h-[calc(100vh-16rem)] flex-col p-0">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          {isLoading ? (
            <PageSpinner />
          ) : isError ? (
            <ErrorState title="Could not load chat" onRetry={retry} />
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-500">
              No messages yet. Say hello to coordinate the job.
            </p>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === user?._id
              if (message.type === 'system') {
                return (
                  <p key={message._id} className="text-center text-xs text-gray-400">
                    {message.text}
                  </p>
                )
              }
              return (
                <div
                  key={message._id}
                  className={cn('flex flex-col', isMine ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-md rounded-2xl px-4 py-2',
                      isMine ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-800',
                    )}
                  >
                    {message.text}
                  </div>
                  <span className="mt-0.5 text-[11px] text-gray-400">
                    {formatDate(message.createdAt, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })
          )}
          {peerTyping && <p className="text-xs italic text-gray-400">typing…</p>}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-100 p-4">
          <input
            className="input flex-1"
            placeholder="Type a message"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              notifyTyping()
            }}
            disabled={!connected}
          />
          <Button type="submit" disabled={!connected || !draft.trim()}>
            Send
          </Button>
        </form>
      </Card>
    </DashboardLayout>
  )
}
