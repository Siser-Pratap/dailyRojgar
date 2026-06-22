import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env } from '../config/env'
import { getRedisClient } from '../config/redis'
import { ApiError } from '../utils/ApiError'
import {
  OTP_LOCK_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
  PASSWORD_SALT_ROUNDS,
} from '../config/constants'
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from '../repositories/user.repository'
import { UserModel } from '../models/User.model'

interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  role?: 'customer' | 'worker' | 'admin'
}

interface LoginInput {
  email: string
  password: string
}

interface RefreshInput {
  refreshToken: string
}

interface VerifyOtpInput {
  phone: string
  otp: string
}

interface ResetPasswordInput {
  token: string
  password: string
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

function parseDurationToSeconds(value: string): number {
  const match = value.match(/^([0-9]+)([smhd])$/i)
  if (!match) return 60 * 60 * 24 * 7
  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const map: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 60 * 60 * 24,
  }
  return amount * map[unit]
}

function signTokens(userId: string, role: 'customer' | 'worker' | 'admin') {
  const accessToken = jwt.sign({ sub: userId, role }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })

  const refreshToken = jwt.sign({ sub: userId, role }, env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })

  return { accessToken, refreshToken }
}

export async function registerUser(input: RegisterInput) {
  const existingEmail = await findUserByEmail(input.email)
  if (existingEmail) {
    throw ApiError.conflict('Email already exists', 'USER_002')
  }

  const existingPhone = await findUserByPhone(input.phone)
  if (existingPhone) {
    throw ApiError.conflict('Phone already exists', 'USER_003')
  }

  const hashedPassword = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS)

  const user = await createUser({
    ...input,
    password: hashedPassword,
    isVerified: true,
  })

  const userData = user.toJSON()
  const tokens = signTokens(userData._id.toString(), userData.role)

  return { user: userData, tokens }
}

export async function loginUser(input: LoginInput) {
  const user = await findUserByEmail(input.email)
  if (!user) {
    throw ApiError.unauthorized('Invalid credentials', 'AUTH_001')
  }

  if (!user.isActive || !user.isVerified) {
    throw ApiError.unauthorized('Account is inactive or not verified', 'AUTH_001')
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password)
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid credentials', 'AUTH_001')
  }

  const tokens = signTokens(user._id.toString(), user.role)
  const redis = getRedisClient()
  const refreshKey = `refresh:${user._id.toString()}`
  await redis.set(
    refreshKey,
    tokens.refreshToken,
    'EX',
    parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN),
  )

  return { user: { ...user, password: undefined }, tokens }
}

export async function refreshAccessToken(input: RefreshInput) {
  let payload: { sub: string; role: 'customer' | 'worker' | 'admin' }

  try {
    payload = jwt.verify(input.refreshToken, env.JWT_REFRESH_SECRET) as typeof payload
  } catch {
    throw ApiError.unauthorized('Invalid refresh token', 'AUTH_002')
  }

  const redis = getRedisClient()
  const refreshKey = `refresh:${payload.sub}`
  const storedToken = await redis.get(refreshKey)

  if (!storedToken || storedToken !== input.refreshToken) {
    throw ApiError.unauthorized('Invalid refresh token', 'AUTH_002')
  }

  const user = await findUserById(payload.sub)
  if (!user || !user.isActive || !user.isVerified) {
    throw ApiError.unauthorized('Account is inactive', 'AUTH_001')
  }

  const tokens = signTokens(payload.sub, payload.role)
  await redis.set(
    refreshKey,
    tokens.refreshToken,
    'EX',
    parseDurationToSeconds(env.JWT_REFRESH_EXPIRES_IN),
  )

  return { user, tokens }
}

export async function logoutUser(userId: string, accessToken?: string) {
  const redis = getRedisClient()
  const operations: Array<Promise<unknown>> = [redis.del(`refresh:${userId}`)]

  if (accessToken) {
    const decoded = jwt.decode(accessToken) as { exp?: number } | null
    const ttl = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 0
    if (ttl > 0) {
      operations.push(redis.set(`blacklist:${accessToken}`, '1', 'EX', ttl))
    }
  }

  await Promise.all(operations)
}

export async function resendOtp(phone: string) {
  const user = await findUserByPhone(phone)
  if (!user) throw ApiError.notFound('User')

  const otp = generateOtp()
  const redis = getRedisClient()
  await Promise.all([
    redis.set(`otp:${phone}`, otp, 'EX', OTP_TTL_SECONDS),
    redis.del(`otp:attempts:${phone}`),
    redis.del(`otp:lock:${phone}`),
  ])

  return {
    phone,
    expiresIn: OTP_TTL_SECONDS,
    // Exposed only to keep local/dev setup testable until SMS integration is enabled.
    otp: env.NODE_ENV === 'production' ? undefined : otp,
  }
}

export async function verifyOtp(input: VerifyOtpInput) {
  const redis = getRedisClient()
  const lockKey = `otp:lock:${input.phone}`
  const isLocked = await redis.get(lockKey)
  if (isLocked) {
    throw ApiError.tooManyRequests('Too many failed OTP attempts. Please try again later')
  }

  const storedOtp = await redis.get(`otp:${input.phone}`)
  if (!storedOtp || storedOtp !== input.otp) {
    const attempts = await redis.incr(`otp:attempts:${input.phone}`)
    await redis.expire(`otp:attempts:${input.phone}`, OTP_TTL_SECONDS)
    if (attempts >= OTP_MAX_ATTEMPTS) {
      await redis.set(lockKey, '1', 'EX', OTP_LOCK_SECONDS)
      await redis.del(`otp:${input.phone}`)
      throw ApiError.tooManyRequests('Too many failed OTP attempts. Please try again later')
    }
    throw ApiError.badRequest('Invalid or expired OTP', 'OTP_INVALID')
  }

  const user = await UserModel.findOneAndUpdate(
    { phone: input.phone },
    { $set: { isVerified: true } },
    { new: true },
  ).lean()
  if (!user) throw ApiError.notFound('User')

  await Promise.all([redis.del(`otp:${input.phone}`), redis.del(`otp:attempts:${input.phone}`)])
  return { user: { ...user, password: undefined } }
}

export async function forgotPassword(email: string) {
  const user = await findUserByEmail(email)
  // Avoid account enumeration: always return success-shaped response.
  if (!user) return { email, resetToken: undefined }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const redis = getRedisClient()
  await redis.set(`password-reset:${resetToken}`, user._id.toString(), 'EX', 60 * 60)

  return {
    email,
    expiresIn: 60 * 60,
    resetToken: env.NODE_ENV === 'production' ? undefined : resetToken,
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const redis = getRedisClient()
  const userId = await redis.get(`password-reset:${input.token}`)
  if (!userId) throw ApiError.badRequest('Invalid or expired reset token', 'RESET_TOKEN_INVALID')

  const hashedPassword = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS)
  const user = await UserModel.findByIdAndUpdate(userId, { $set: { password: hashedPassword } })
  if (!user) throw ApiError.notFound('User')

  await Promise.all([redis.del(`password-reset:${input.token}`), redis.del(`refresh:${userId}`)])
}
