export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected'
export type DocumentType = 'aadhaar' | 'pan' | 'photo' | 'certificate'
export type WorkingDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface Skill {
  categoryId: string
  name: string
  yearsExperience: number
}

export interface WorkerDocument {
  type: DocumentType
  url: string
  verifiedAt: string | null
}

export interface WorkerAvailability {
  isAvailable: boolean
  workingDays: WorkingDay[]
  workingHours: {
    from: string // "08:00"
    to: string // "20:00"
  }
}

export interface WorkerRating {
  average: number
  totalReviews: number
}

export interface WorkerStats {
  completedJobs: number
  cancelledJobs: number
  totalEarnings: number
}

export interface Worker {
  _id: string
  userId: string
  skills: Skill[]
  bio: string
  documents: WorkerDocument[]
  verificationStatus: VerificationStatus
  rejectionReason: string | null
  availability: WorkerAvailability
  pricePerDay: number
  rating: WorkerRating
  stats: WorkerStats
  isAvailableNow: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkerWithUser extends Worker {
  user: {
    name: string
    profileImage: string | null
    phone: string
    location?: {
      type: 'Point'
      coordinates: [number, number]
    }
    address?: {
      city: string
      state: string
    }
  }
  // Injected by geo-search
  distance?: number
}
