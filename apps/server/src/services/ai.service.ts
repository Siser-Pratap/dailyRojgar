import { BookingModel } from '../models/Booking.model'
import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { generateWorkerBio, isClaudeEnabled } from './claude.service'

const CATEGORY_BASELINE_PRICE: Record<string, number> = {
  Construction: 900,
  Electrical: 850,
  Plumbing: 750,
  Cleaning: 650,
  'House Help': 700,
  Painting: 850,
  Repairs: 800,
  Driving: 900,
  Gardening: 650,
  Sanitation: 700,
}

const DEMAND_PINCODE_MULTIPLIER: Record<string, number> = {
  '110001': 1.18,
  '110024': 1.12,
  '201301': 1.15,
  '201014': 1.1,
  '400001': 1.2,
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

function calculateSmartMatchScore(input: {
  distanceKm: number | null
  rating: number
  completedJobs: number
  isAvailableNow: boolean
}) {
  const proximity = input.distanceKm === null ? 0.15 : (1 / Math.max(input.distanceKm, 0.5)) * 0.3
  const quality = (input.rating / 5) * 0.35
  const experience = Math.min(input.completedJobs / 100, 1) * 0.2
  const availability = (input.isAvailableNow ? 1 : 0) * 0.15
  const score = proximity + quality + experience + availability

  return {
    score: Number(score.toFixed(4)),
    breakdown: {
      proximity: Number(proximity.toFixed(4)),
      quality: Number(quality.toFixed(4)),
      experience: Number(experience.toFixed(4)),
      availability: Number(availability.toFixed(4)),
    },
  }
}

export async function getSmartWorkerMatches(options: {
  q?: string
  lat?: number
  lng?: number
  radius?: number
  categoryId?: string
  limit?: number
}) {
  const filter: Record<string, unknown> = { verificationStatus: 'approved' }
  if (options.categoryId) filter.categoryId = options.categoryId
  if (options.q) filter.$text = { $search: options.q }

  const profiles = await WorkerProfileModel.find(filter)
    .populate('userId', 'name email phone profileImage address location')
    .limit(100)
    .lean()

  const matched = profiles
    .map((profile) => {
      const distanceKm =
        options.lat !== undefined &&
        options.lng !== undefined &&
        profile.location?.coordinates?.length === 2
          ? haversineDistance(
              options.lat,
              options.lng,
              profile.location.coordinates[1],
              profile.location.coordinates[0],
            )
          : null

      const { score, breakdown } = calculateSmartMatchScore({
        distanceKm,
        rating: profile.rating?.average ?? 0,
        completedJobs: profile.totalJobs ?? 0,
        isAvailableNow: profile.isAvailable,
      })

      return {
        ...profile,
        distance: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
        smartMatch: {
          score,
          breakdown,
          explanation: [
            profile.isAvailable ? 'available now' : 'currently busy',
            `${profile.rating?.average ?? 0}/5 rating`,
            `${profile.totalJobs ?? 0} completed jobs`,
            distanceKm === null ? 'distance unavailable' : `${distanceKm.toFixed(1)} km away`,
          ],
        },
      }
    })
    .filter((profile) => {
      if (options.lat === undefined || options.lng === undefined) return true
      return profile.distance === null || profile.distance <= (options.radius ?? 10)
    })
    .sort((a, b) => b.smartMatch.score - a.smartMatch.score)
    .slice(0, options.limit ?? 10)

  return { items: matched, algorithm: 'rule-based-v1' }
}

function getTimeMultiplier(date: Date) {
  const day = date.getDay()
  const hour = date.getHours()
  const weekend = day === 0 || day === 6
  const peakHour = hour >= 8 && hour <= 11
  const evening = hour >= 17 && hour <= 20
  if (weekend && (peakHour || evening)) return 1.18
  if (weekend) return 1.1
  if (peakHour || evening) return 1.08
  return 1
}

export async function getDynamicPriceRecommendation(input: {
  categoryId: string
  pincode?: string
  scheduledAt?: Date
  estimatedHours?: number
  lat?: number
  lng?: number
}) {
  const baseline = CATEGORY_BASELINE_PRICE[input.categoryId] ?? 750
  const scheduledAt = input.scheduledAt ?? new Date()
  const estimatedHours = input.estimatedHours ?? 8
  const hourlyAdjustedBase = Math.round((baseline * estimatedHours) / 8)

  const locationMultiplier = input.pincode ? (DEMAND_PINCODE_MULTIPLIER[input.pincode] ?? 1) : 1
  const timeMultiplier = getTimeMultiplier(scheduledAt)

  const [availableWorkers, demandBookings] = await Promise.all([
    WorkerProfileModel.countDocuments({
      categoryId: input.categoryId,
      verificationStatus: 'approved',
      isAvailable: true,
    }),
    BookingModel.countDocuments({
      categoryId: input.categoryId,
      scheduledDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      status: { $in: ['pending', 'accepted', 'in_progress'] },
      ...(input.pincode ? { 'address.pincode': input.pincode } : {}),
    }),
  ])

  const supplyDemandRatio = demandBookings / Math.max(availableWorkers, 1)
  const supplyDemandMultiplier = Math.min(1.3, Math.max(0.9, 1 + supplyDemandRatio * 0.08))
  const suggested = Math.round(
    hourlyAdjustedBase * locationMultiplier * timeMultiplier * supplyDemandMultiplier,
  )

  return {
    categoryId: input.categoryId,
    baseline,
    estimatedHours,
    suggestedPrice: suggested,
    suggestedRange: {
      min: Math.round(suggested * 0.9),
      max: Math.round(suggested * 1.15),
    },
    factors: {
      locationMultiplier: Number(locationMultiplier.toFixed(2)),
      timeMultiplier: Number(timeMultiplier.toFixed(2)),
      supplyDemandMultiplier: Number(supplyDemandMultiplier.toFixed(2)),
      availableWorkers,
      demandBookings,
    },
  }
}

export async function getProfileAssistantSuggestions(input: {
  bio?: string
  skills?: string[]
  categoryId?: string
  pricePerDay?: number
}) {
  const suggestions: Array<{ type: string; title: string; detail: string }> = []
  const bio = input.bio?.trim() ?? ''
  const skills = input.skills ?? []

  if (bio.length < 80) {
    suggestions.push({
      type: 'profile_improvement',
      title: 'Add a stronger work summary',
      detail:
        'Mention years of experience, service area, response time, and 2-3 common jobs you handle.',
    })
  }

  if (skills.length < 3) {
    suggestions.push({
      type: 'skill_gap',
      title: 'Add more searchable skills',
      detail: 'Profiles with at least 3 skills match more customer searches.',
    })
  }

  if (
    input.categoryId &&
    !skills.some((skill) => skill.toLowerCase().includes(input.categoryId!.toLowerCase()))
  ) {
    suggestions.push({
      type: 'skill_gap',
      title: 'Add category-specific keywords',
      detail: `Include terms customers search for in ${input.categoryId}, such as repair, installation, inspection, or maintenance.`,
    })
  }

  const baseline = input.categoryId ? CATEGORY_BASELINE_PRICE[input.categoryId] : undefined
  if (baseline && input.pricePerDay && Math.abs(input.pricePerDay - baseline) / baseline > 0.35) {
    suggestions.push({
      type: 'pricing',
      title: 'Review your listed price',
      detail: `Typical baseline for ${input.categoryId} is around ₹${baseline}/day. Use dynamic pricing to stay competitive.`,
    })
  }

  // Optional Claude enhancement: a polished bio the worker can adopt. Falls
  // back to rule-based only (improvedBio omitted) when Claude is unavailable.
  const improvedBio = await generateWorkerBio({
    categoryId: input.categoryId,
    skills: input.skills ?? [],
    currentBio: input.bio,
  })

  return {
    assistant: improvedBio
      ? `claude:${process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8'}`
      : 'rule-based-profile-assistant-v1',
    aiEnabled: isClaudeEnabled(),
    suggestions,
    improvedBio: improvedBio ?? undefined,
    nextBestAction: suggestions[0]?.title ?? 'Your profile looks ready for customer discovery.',
  }
}
