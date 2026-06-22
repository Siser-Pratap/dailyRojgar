import { PageShell, SectionCard } from '@/features/phase8/components'

const messages = [
  { from: 'worker', text: 'Namaste, I am on the way.' },
  { from: 'me', text: 'Please call when you reach the gate.' },
  { from: 'worker', text: 'Sure, reaching in 10 minutes.' },
]

export default function ChatPage() {
  return (
    <PageShell
      title="Booking chat"
      subtitle="Realtime chat room for customer and worker coordination."
    >
      <SectionCard title="chat:DR-2026-000128">
        <div className="grid gap-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.from === 'me'
                  ? 'ml-auto max-w-md rounded-2xl bg-primary-600 p-3 text-white'
                  : 'mr-auto max-w-md rounded-2xl bg-gray-100 p-3 text-gray-800'
              }
            >
              {message.text}
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <input className="input" placeholder="Type a message" />
          <button className="btn-primary btn-md">Send</button>
        </div>
      </SectionCard>
    </PageShell>
  )
}
