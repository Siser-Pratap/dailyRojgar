import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { getRedisClient } from '../config/redis'
import { ApiError } from '../utils/ApiError'
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone,
} from '../repositories/user.repository'

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

  const hashedPassword = await bcrypt.hash(input.password, 12)

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

export async function logoutUser(userId: string) {
  const redis = getRedisClient()
  await redis.del(`refresh:${userId}`)
}
