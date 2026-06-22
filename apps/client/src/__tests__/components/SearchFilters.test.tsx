import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SearchPage from '@/features/search/pages/SearchPage'

vi.mock('@/features/ai/components', () => ({
  SmartMatchingPanel: () => <div>Mock smart matching panel</div>,
}))

describe('Search filters', () => {
  it('renders all key discovery filters', () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText('Service category')).toBeInTheDocument()
    expect(screen.getByText('Maximum price/day')).toBeInTheDocument()
    expect(screen.getByText('Minimum rating')).toBeInTheDocument()
    expect(screen.getByText('Available now')).toBeInTheDocument()
    expect(screen.getByText('Mock smart matching panel')).toBeInTheDocument()
  })
})
