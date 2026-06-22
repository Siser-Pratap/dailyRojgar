import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import BookingDetailPage from '@/features/booking/pages/BookingDetailPage'

describe('Booking flow preview', () => {
  it('renders all booking flow steps and payment CTA', () => {
    render(
      <MemoryRouter>
        <BookingDetailPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Select service category')).toBeInTheDocument()
    expect(screen.getByText('Choose payment')).toBeInTheDocument()
    expect(screen.getByText('Booking confirmed')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /continue to payment/i })).toBeInTheDocument()
  })
})
