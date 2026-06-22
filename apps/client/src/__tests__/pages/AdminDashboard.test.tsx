import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AdminDashboard from '@/features/admin/pages/DashboardPage'
import { fetchAdminDashboard } from '@/features/admin/api'

vi.mock('@/features/admin/api', () => ({
  fetchAdminDashboard: vi.fn(),
}))

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AdminDashboard', () => {
  it('renders live metrics from API', async () => {
    vi.mocked(fetchAdminDashboard).mockResolvedValue({
      users: 10,
      newToday: 2,
      workers: 5,
      activeWorkers: 3,
      bookingsToday: 4,
      revenueToday: 1200,
      pendingDisputes: 1,
      pendingVerifications: 2,
      revenue: 5000,
    })

    renderWithProviders(<AdminDashboard />)

    expect(await screen.findByText('10')).toBeInTheDocument()
    expect(screen.getByText('₹1,200')).toBeInTheDocument()
    expect(screen.getByText(/Pending disputes: 1/)).toBeInTheDocument()
  })
})
