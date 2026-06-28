import { render, screen } from '@testing-library/react'
import { StatusTimeline } from '@/features/booking/components/StatusTimeline'
import type { BookingStatusEntry } from '@/features/booking/api'

describe('StatusTimeline', () => {
  it('renders each status entry with its reason', () => {
    const history: BookingStatusEntry[] = [
      { status: 'pending', by: 'c1', at: '2026-06-20T10:00:00.000Z' },
      { status: 'accepted', by: 'w1', at: '2026-06-20T11:00:00.000Z' },
      { status: 'cancelled', by: 'c1', at: '2026-06-21T09:00:00.000Z', reason: 'Changed plans' },
    ]

    render(<StatusTimeline history={history} />)

    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('accepted')).toBeInTheDocument()
    expect(screen.getByText('cancelled')).toBeInTheDocument()
    expect(screen.getByText('Changed plans')).toBeInTheDocument()
  })

  it('shows an empty message when there is no history', () => {
    render(<StatusTimeline history={[]} />)
    expect(screen.getByText(/no status updates yet/i)).toBeInTheDocument()
  })
})
