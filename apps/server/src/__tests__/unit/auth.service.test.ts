import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { loginUser, registerUser } from '../../services/auth.service'
import { getRedisClient } from '../../config/redis'
import { UserModel } from '../../models/User.model'
import { createUser, findUserByEmail, findUserByPhone } from '../../repositories/user.repository'

jest.mock('bcryptjs', () => ({ hash: jest.fn(), compare: jest.fn() }))
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(), verify: jest.fn(), decode: jest.fn() }))
jest.mock('../../config/redis', () => ({ getRedisClient: jest.fn() }))
jest.mock('../../repositories/user.repository', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  findUserByPhone: jest.fn(),
}))
jest.mock('../../models/User.model', () => ({
  UserModel: { findByIdAndUpdate: jest.fn(), findOneAndUpdate: jest.fn() },
}))

describe('auth service', () => {
  const redis = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getRedisClient as jest.Mock).mockReturnValue(redis)
    ;(jwt.sign as jest.Mock)
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token')
  })

  it('registers a user with hashed password and tokens', async () => {
    ;(findUserByEmail as jest.Mock).mockResolvedValue(null)
    ;(findUserByPhone as jest.Mock).mockResolvedValue(null)
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
    ;(createUser as jest.Mock).mockResolvedValue({
      toJSON: () => ({ _id: 'user-1', role: 'customer', email: 'a@example.com' }),
    })

    const result = await registerUser({
      name: 'Amit',
      email: 'a@example.com',
      phone: '9876543210',
      password: 'password123',
    })

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed-password' }),
    )
    expect(redis.set).toHaveBeenCalledWith(
      'refresh:user-1',
      'refresh-token',
      'EX',
      expect.any(Number),
    )
    expect(result.tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' })
  })

  it('rejects duplicate email during registration', async () => {
    ;(findUserByEmail as jest.Mock).mockResolvedValue({ _id: 'existing' })

    await expect(
      registerUser({
        name: 'Amit',
        email: 'a@example.com',
        phone: '9876543210',
        password: 'password123',
      }),
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it('logs in active verified user and stores refresh token plus fcm token', async () => {
    const user = {
      _id: { toString: () => 'user-1' },
      email: 'a@example.com',
      password: 'hashed-password',
      role: 'worker',
      isActive: true,
      isVerified: true,
    }
    ;(findUserByEmail as jest.Mock).mockResolvedValue(user)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const result = await loginUser({
      email: 'a@example.com',
      password: 'password123',
      fcmToken: 'fcm-token-1234567890',
    })

    expect(redis.set).toHaveBeenCalledWith(
      'refresh:user-1',
      'refresh-token',
      'EX',
      expect.any(Number),
    )
    expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(user._id, {
      $addToSet: { fcmTokens: 'fcm-token-1234567890' },
    })
    expect(result.tokens.accessToken).toBe('access-token')
  })
})
