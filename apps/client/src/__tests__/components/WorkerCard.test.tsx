import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { WorkerCard } from '@/features/phase8/components'
import { workers } from '@/features/phase8/mockData'

describe('WorkerCard', () => {
  it('renders worker identity, skills, rating, and price', () => {
    render(
      <MemoryRouter>
        <WorkerCard worker={workers[0]} />
      </MemoryRouter>,
    )

    expect(screen.getByText(workers[0].name)).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Wiring')).toBeInTheDocument()
    expect(screen.getByText(/₹850\/day/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view profile/i })).toHaveAttribute(
      'href',
      '/workers/w1',
    )
  })
})
