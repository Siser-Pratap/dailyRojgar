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
  getUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { sub: 'user-1', role: 'customer', iat: 1, exp: 9999999999 }
    next()
  },
  authorize: () => (_req: any, _res: any, next: any) => next(),
}))

describe('auth profile routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('returns the full current user via GET /api/auth/me', async () => {
    ;(authService.getUserProfile as jest.Mock).mockResolvedValue({
      _id: 'user-1',
      name: 'Amit',
      email: 'amit@example.com',
    })

    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(200)
    expect(res.body.data.user.name).toBe('Amit')
    expect(authService.getUserProfile).toHaveBeenCalledWith('user-1')
  })

  it('updates the profile via PATCH /api/auth/me', async () => {
    ;(authService.updateUserProfile as jest.Mock).mockResolvedValue({
      _id: 'user-1',
      name: 'Amit Sharma',
    })

    const res = await request(app)
      .patch('/api/auth/me')
      .send({ name: 'Amit Sharma', address: { city: 'Noida' } })

    expect(res.status).toBe(200)
    expect(authService.updateUserProfile).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ name: 'Amit Sharma' }),
    )
  })

  it('rejects an empty profile update', async () => {
    const res = await request(app).patch('/api/auth/me').send({})

    expect(res.status).toBe(422)
    expect(authService.updateUserProfile).not.toHaveBeenCalled()
  })

  it('rejects an invalid phone', async () => {
    const res = await request(app).patch('/api/auth/me').send({ phone: '123' })

    expect(res.status).toBe(422)
    expect(authService.updateUserProfile).not.toHaveBeenCalled()
  })
})
