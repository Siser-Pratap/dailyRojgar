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
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
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
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  },
}

describe('auth pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useAuthStore.getState().clearAuth()
  })

  it('submits login and stores auth tokens', async () => {
    vi.mocked(login).mockResolvedValue(authResult)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'amit@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ email: 'amit@example.com', password: 'password123' }),
    )
    expect(localStorage.getItem('accessToken')).toBe('access-token')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
  })

  it('submits register and stores auth tokens', async () => {
    vi.mocked(register).mockResolvedValue(authResult)

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await userEvent.type(screen.getByLabelText(/full name/i), 'Amit Sharma')
    await userEvent.type(screen.getByLabelText(/phone/i), '9876543210')
    await userEvent.type(screen.getByLabelText(/email/i), 'amit@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /register/i }))

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        name: 'Amit Sharma',
        phone: '9876543210',
        email: 'amit@example.com',
        role: 'customer',
        password: 'password123',
      }),
    )
    expect(localStorage.getItem('accessToken')).toBe('access-token')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
  })
})
