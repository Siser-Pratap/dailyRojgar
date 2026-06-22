import { WorkerProfileModel } from '../models/WorkerProfile.model'
import { UserModel } from '../models/User.model'
import { BookingModel } from '../models/Booking.model'
import { ApiError } from '../utils/ApiError'
import { parsePagination } from '../utils/pagination'

export async function listWorkers(query: {
  q?: string
  categoryId?: string
  availability?: boolean
  page?: number
  limit?: number
}) {
  const pagination = parsePagination(query)
  const filter: Record<string, unknown> = {}
  if (query.categoryId) filter.categoryId = query.categoryId
  if (query.availability !== undefined) filter.isAvailable = query.availability
  if (query.q) filter.$text = { $search: query.q }

  const [items, total] = await Promise.all([
    WorkerProfileModel.find(filter)
      .populate('userId', 'name email phone profileImage address location')
      .sort(query.q ? { score: { $meta: 'textScore' } } : { 'rating.average': -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    WorkerProfileModel.countDocuments(filter),
  ])

  return { items, total, ...pagination }
}

export async function getWorkerPublicProfile(id: string) {
  const profile = await WorkerProfileModel.findOne({ userId: id })
    .populate('userId', 'name email phone profileImage address location')
    .lean()

  if (!profile) throw ApiError.notFound('Worker profile')
  return profile
}

export async function upsertWorkerProfile(
  userId: string,
  input: {
    categoryId: string
    skills: string[]
    bio?: string
    experienceYears?: number
    pricePerDay: number
    location?: { lat: number; lng: number }
  },
) {
  const user = await UserModel.findById(userId).lean()
  if (!user || user.role !== 'worker') throw ApiError.forbidden('Only workers can manage profiles')

  const location = input.location
    ? { type: 'Point' as const, coordinates: [input.location.lng, input.location.lat] }
    : undefined

  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId },
    {
      $set: {
        categoryId: input.categoryId,
        skills: input.skills,
        bio: input.bio,
        experienceYears: input.experienceYears ?? 0,
        pricePerDay: input.pricePerDay,
        ...(location ? { location } : {}),
      },
      $setOnInsert: { userId },
    },
    { new: true, upsert: true, runValidators: true },
  ).lean()

  if (location) {
    await UserModel.findByIdAndUpdate(userId, { $set: { location } })
  }

  return profile
}

export async function updateAvailability(userId: string, isAvailable: boolean) {
  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId },
    { $set: { isAvailable } },
    { new: true },
  ).lean()
  if (!profile) throw ApiError.notFound('Worker profile')
  return profile
}

export async function addWorkerDocument(userId: string, input: { type: string; url: string }) {
  const profile = await WorkerProfileModel.findOneAndUpdate(
    { userId },
    { $push: { documents: { ...input, status: 'pending', uploadedAt: new Date() } } },
    { new: true },
  ).lean()
  if (!profile) throw ApiError.notFound('Worker profile')
  return profile
}

export async function getWorkerStats(userId: string) {
  const profile = await WorkerProfileModel.findOne({ userId }).lean()
  if (!profile) throw ApiError.notFound('Worker profile')

  const [completedJobs, activeJobs] = await Promise.all([
    BookingModel.countDocuments({ workerId: userId, status: 'completed' }),
    BookingModel.countDocuments({
      workerId: userId,
      status: { $in: ['pending', 'accepted', 'in_progress'] },
    }),
  ])

  return {
    totalJobs: profile.totalJobs || completedJobs,
    completedJobs,
    activeJobs,
    totalEarnings: profile.totalEarnings,
    rating: profile.rating,
    isAvailable: profile.isAvailable,
  }
}

export async function getWorkerJobs(userId: string, query: { page?: number; limit?: number }) {
  const pagination = parsePagination(query)
  const [items, total] = await Promise.all([
    BookingModel.find({ workerId: userId })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    BookingModel.countDocuments({ workerId: userId }),
  ])
  return { items, total, ...pagination }
}
