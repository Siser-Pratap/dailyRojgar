import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WorkerCard } from '@/features/search/components/WorkerCard'
import type { SearchWorker } from '@/features/search/api'

const worker: SearchWorker = {
  _id: 'profile-1',
  userId: { _id: 'user-1', name: 'Ramesh Kumar', profileImage: null },
  verificationStatus: 'approved',
  categoryId: 'Electrical',
  skills: ['Wiring', 'Fan repair'],
  experienceYears: 5,
  pricePerDay: 850,
  isAvailable: true,
  rating: { average: 4.6, totalReviews: 12 },
  totalJobs: 40,
  distance: 2.3,
  smartMatchScore: 0.8,
}

describe('search WorkerCard', () => {
  it('renders worker info and links to the public profile by user id', () => {
    render(
      <MemoryRouter>
        <WorkerCard worker={worker} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument()
    expect(screen.getByText(/Electrical/)).toBeInTheDocument()
    expect(screen.getByText('₹850/day')).toBeInTheDocument()
    expect(screen.getByText(/4.6/)).toBeInTheDocument()

    // The profile link must use the worker's *user* id, not the profile id.
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/workers/user-1')
  })
})
