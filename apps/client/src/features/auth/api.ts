import apiClient from '@/lib/axios'

export type UserRole = 'customer' | 'worker' | 'admin'

export interface UserAddress {
  street?: string
  city?: string
  state?: string
  pincode?: string
}

export interface AuthUser {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  profileImage: string | null
  isVerified: boolean
  address?: UserAddress
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  profileImage?: string
  address?: UserAddress
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

/** Returns the current user (or null if the session is invalid). */
export async function getCurrentSession() {
  const { data } = await apiClient.get<ApiEnvelope<{ user: AuthUser } | null>>('/auth/me')
  return data.data
}

/** Fetches the full current-user profile. */
export async function getProfile(): Promise<AuthUser> {
  const { data } = await apiClient.get<ApiEnvelope<{ user: AuthUser }>>('/auth/me')
  return data.data.user
}

export async function updateProfile(input: UpdateProfileInput): Promise<AuthUser> {
  const { data } = await apiClient.patch<ApiEnvelope<{ user: AuthUser }>>('/auth/me', input)
  return data.data.user
}
