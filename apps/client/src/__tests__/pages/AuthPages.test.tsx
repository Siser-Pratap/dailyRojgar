import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { useAuthStore } from '@/app/store'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { login, register } from '@/features/auth/api'

vi.mock('@/features/auth/api', () => ({
  login: vi.fn(),
  register: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

const authResult = {
  user: {
    _id: 'user-1',
    name: 'Amit Sharma',
    email: 'amit@example.com',
    phone: '9876543210',
    role: 'customer' as const,
    profileImage: null,
    isVerified: true,
  },
  tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
}

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.getState().clearAuth()
  })

  it('submits login and stores auth tokens', async () => {
    vi.mocked(login).mockResolvedValue(authResult)

    renderWithProviders(<LoginPage />)

    await userEvent.type(screen.getByLabelText(/email/i), 'amit@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    // The page nav also has a "Login" button; the form submit is the last one.
    const loginButtons = screen.getAllByRole('button', { name: /login/i })
    await userEvent.click(loginButtons[loginButtons.length - 1])

    // React Query passes (variables, context) — assert on the variables only.
    await waitFor(() => expect(login).toHaveBeenCalled())
    expect(vi.mocked(login).mock.calls[0][0]).toEqual({
      email: 'amit@example.com',
      password: 'password123',
    })
    expect(localStorage.getItem('accessToken')).toBe('access-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('submits register and stores auth tokens', async () => {
    vi.mocked(register).mockResolvedValue(authResult)

    renderWithProviders(<RegisterPage />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Amit Sharma')
    await userEvent.type(screen.getByLabelText(/phone/i), '9876543210')
    await userEvent.type(screen.getByLabelText(/email/i), 'amit@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(register).toHaveBeenCalled())
    expect(vi.mocked(register).mock.calls[0][0]).toEqual({
      name: 'Amit Sharma',
      phone: '9876543210',
      email: 'amit@example.com',
      role: 'customer',
      password: 'password123',
    })
    expect(localStorage.getItem('accessToken')).toBe('access-token')
  })
})
