export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'disputed'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'
export type PaymentMethod = 'online' | 'cash'
export type CancelledBy = 'customer' | 'worker' | 'admin'

export interface BookingLocation {
  type: 'Point'
  coordinates: [number, number]
  address: string
}

export interface BookingPricing {
  baseAmount: number
  platformFee: number
  totalAmount: number
  currency: 'INR'
}

export interface Booking {
  _id: string
  bookingNumber: string
  customerId: string
  workerId: string
  serviceId: string
  status: BookingStatus
  scheduledDate: string
  scheduledTime: string
  estimatedHours: number
  location: BookingLocation
  notes: string
  pricing: BookingPricing
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  cancellationReason: string | null
  cancelledBy: CancelledBy | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BookingWithDetails extends Booking {
  customer: { name: string; phone: string; profileImage: string | null }
  worker: { name: string; phone: string; profileImage: string | null; pricePerDay: number }
  service: { name: string; category: string; icon: string }
}

export interface Review {
  _id: string
  bookingId: string
  customerId: string
  workerId: string
  rating: number
  comment: string
  isPublic: boolean
  reply: string | null
  repliedAt: string | null
  createdAt: string
}
