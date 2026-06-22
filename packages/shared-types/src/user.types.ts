export type UserRole = 'customer' | 'worker' | 'admin'

export interface GeoPoint {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface Address {
  street?: string
  city: string
  state: string
  pincode: string
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  profileImage: string | null
  isActive: boolean
  isVerified: boolean
  location?: GeoPoint
  address?: Address
  createdAt: string
  updatedAt: string
}

export interface PublicUser {
  _id: string
  name: string
  profileImage: string | null
  role: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
