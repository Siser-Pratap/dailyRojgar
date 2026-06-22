import { BOOKING_NUMBER_PREFIX } from '../config/constants'

let sequence = 0

/**
 * Generates a booking number in the format DR-2024-000001.
 * In production this should use an atomic counter from Redis/DB.
 */
export function generateBookingNumber(): string {
  sequence += 1
  const year = new Date().getFullYear()
  const seq = String(sequence).padStart(6, '0')
  return `${BOOKING_NUMBER_PREFIX}-${year}-${seq}`
}
