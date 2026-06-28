import apiClient from '@/lib/axios'

export type UserRole = 'customer' | 'worker' | 'admin'

export interface AuthUser {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  profileImage: string | null
  isVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResult {
  user: AuthUser
  tokens: AuthTokens
}

interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export async function login(input: { email: string; password: string; fcmToken?: string }) {
  const { data } = await apiClient.post<ApiEnvelope<AuthResult>>('/auth/login', input)
  return data.data
}

export async function register(input: {
  name: string
  email: string
  phone: string
  password: string
  role?: UserRole
}) {
  const { data } = await apiClient.post<ApiEnvelope<AuthResult>>('/auth/register', input)
  return data.data
}

export async function logout() {
  const { data } = await apiClient.post<ApiEnvelope<null>>('/auth/logout')
  return data.data
}

/** Returns the decoded session payload, or null if the session is invalid. */
export async function getCurrentSession() {
  const { data } =
    await apiClient.get<ApiEnvelope<{ user: { sub: string; role: UserRole } } | null>>('/auth/me')
  return data.data
}
