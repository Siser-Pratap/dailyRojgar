import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SearchPage from '@/features/search/pages/SearchPage'

vi.mock('@/features/ai/components', () => ({
  SmartMatchingPanel: () => <section aria-label="smart matching">Smart matching ready</section>,
}))

describe('SearchPage', () => {
  it('renders worker results, map placeholder, pagination, and UI states', () => {
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /search nearby workers/i })).toBeInTheDocument()
    expect(screen.getByText(/Showing 3 verified workers/)).toBeInTheDocument()
    expect(screen.getByText('Map view')).toBeInTheDocument()
    expect(screen.getByText('Loading skeleton')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })
})
