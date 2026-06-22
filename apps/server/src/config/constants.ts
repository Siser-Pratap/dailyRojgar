export const PLATFORM_FEE_PERCENT = 10

export const OTP_TTL_SECONDS = 600 // 10 minutes
export const OTP_MAX_ATTEMPTS = 3
export const OTP_LOCK_SECONDS = 1800 // 30 minutes

export const BOOKING_CANCEL_WINDOW_AFTER_ACCEPT_HOURS = 24
export const REVIEW_WINDOW_AFTER_COMPLETION_HOURS = 24
export const DISPUTE_WINDOW_AFTER_COMPLETION_HOURS = 24

export const NEARBY_SEARCH_DEFAULT_RADIUS_KM = 10
export const NEARBY_SEARCH_MAX_RADIUS_KM = 50

export const PAGINATION_DEFAULT_LIMIT = 20
export const PAGINATION_MAX_LIMIT = 50

export const PASSWORD_SALT_ROUNDS = 12

export const WORKER_VERIFICATION_DOCS = ['aadhaar', 'photo'] as const

export const BOOKING_NUMBER_PREFIX = 'DR'

export const SERVICE_CATEGORIES = [
  'Construction',
  'Electrical',
  'Plumbing',
  'Cleaning',
  'House Help',
  'Painting',
  'Repairs',
  'Driving',
  'Gardening',
  'Sanitation',
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]
