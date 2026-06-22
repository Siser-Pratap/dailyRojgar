import request from 'supertest'
import { createApp } from '../../app'
import * as authService from '../../services/auth.service'

jest.mock('../../services/auth.service', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  refreshAccessToken: jest.fn(),
  logoutUser: jest.fn(),
  verifyOtp: jest.fn(),
  resendOtp: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}))

describe('auth routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('registers a user through /api/auth/register', async () => {
    ;(authService.registerUser as jest.Mock).mockResolvedValue({
      user: { _id: 'user-1', email: 'amit@example.com' },
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    })

    const res = await request(app).post('/api/auth/register').send({
      name: 'Amit Sharma',
      email: 'amit@example.com',
      phone: '9876543210',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.tokens.accessToken).toBe('access')
  })

  it('validates register payload', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bad' })

    expect(res.status).toBe(422)
    expect(res.body.errorCode).toBe('VALIDATION')
    expect(authService.registerUser).not.toHaveBeenCalled()
  })

  it('logs in through /api/auth/login', async () => {
    ;(authService.loginUser as jest.Mock).mockResolvedValue({
      user: { _id: 'user-1', email: 'amit@example.com' },
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    })

    const res = await request(app).post('/api/auth/login').send({
      email: 'amit@example.com',
      password: 'password123',
      fcmToken: 'fcm-token-1234567890',
    })

    expect(res.status).toBe(200)
    expect(authService.loginUser).toHaveBeenCalledWith(
      expect.objectContaining({ fcmToken: 'fcm-token-1234567890' }),
    )
  })
})
