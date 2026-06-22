import { SERVICE_CATEGORIES } from '../config/constants'
import { WorkerProfileModel } from '../models/WorkerProfile.model'

interface SearchWorkersOptions {
  q?: string
  lat?: number
  lng?: number
  radius?: number
  categoryId?: string
  minRating?: number
  maxPrice?: number
  availability?: boolean
  sortBy?: 'rating' | 'price' | 'distance' | 'reviews' | 'smart'
  page: number
  limit: number
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function searchWorkers(options: SearchWorkersOptions) {
  const { q, lat, lng, radius = 10, sortBy = 'rating', page, limit } = options

  const filters: Record<string, unknown> = {}

  if (q) {
    filters.$text = { $search: q }
  }

  if (options.categoryId) {
    filters.categoryId = options.categoryId
  }

  if (options.minRating !== undefined) {
    filters['rating.average'] = { $gte: options.minRating }
  }

  if (options.maxPrice !== undefined) {
    filters.pricePerDay = { $lte: options.maxPrice }
  }

  if (options.availability !== undefined) {
    filters.isAvailable = options.availability
  }

  const query = WorkerProfileModel.find(filters)
    .populate('userId', 'name email phone profileImage address location')
    .lean()
  const total = await WorkerProfileModel.countDocuments(filters)
  const items = await query.skip((page - 1) * limit).limit(limit)

  const normalized = items.map((item) => {
    const distance =
      lat !== undefined && lng !== undefined && item.location?.coordinates?.length === 2
        ? haversineDistance(lat, lng, item.location.coordinates[1], item.location.coordinates[0])
        : undefined

    return {
      ...item,
      distance: distance !== undefined ? Number(distance.toFixed(2)) : null,
      smartMatchScore: Number(
        (
          (distance !== undefined ? 1 / Math.max(distance, 0.5) : 0.5) * 0.3 +
          ((item.rating?.average ?? 0) / 5) * 0.35 +
          Math.min((item.totalJobs ?? 0) / 100, 1) * 0.2 +
          (item.isAvailable ? 1 : 0) * 0.15
        ).toFixed(4),
      ),
    }
  })

  const sorted = normalized.sort((a, b) => {
    if (sortBy === 'distance') {
      const aDistance = a.distance ?? Number.POSITIVE_INFINITY
      const bDistance = b.distance ?? Number.POSITIVE_INFINITY
      return aDistance - bDistance
    }

    if (sortBy === 'price') {
      return (a.pricePerDay ?? 0) - (b.pricePerDay ?? 0)
    }

    if (sortBy === 'reviews') {
      return (b.rating?.totalReviews ?? 0) - (a.rating?.totalReviews ?? 0)
    }

    if (sortBy === 'smart') {
      return (b.smartMatchScore ?? 0) - (a.smartMatchScore ?? 0)
    }

    return (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
  })

  const filteredByRadius =
    lat !== undefined && lng !== undefined
      ? sorted.filter((item) => item.distance === null || item.distance <= radius)
      : sorted

  return {
    items: filteredByRadius,
    total,
    page,
    limit,
  }
}

export function searchServices(query?: string) {
  const normalized = query?.trim().toLowerCase()
  const categories = SERVICE_CATEGORIES.filter(
    (name) => !normalized || name.toLowerCase().includes(normalized),
  )

  return categories.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }))
}
