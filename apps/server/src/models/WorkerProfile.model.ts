import mongoose, { Schema, Types } from 'mongoose'

export interface WorkerProfileDocument {
  userId: Types.ObjectId
  categoryId: string
  skills: string[]
  bio?: string
  experienceYears: number
  pricePerDay: number
  isAvailable: boolean
  documents: Array<{
    type: 'aadhaar' | 'photo' | 'certificate' | 'other'
    url: string
    status: 'pending' | 'approved' | 'rejected'
    uploadedAt: Date
  }>
  rating: {
    average: number
    totalReviews: number
  }
  totalJobs: number
  totalEarnings: number
  location: {
    type: 'Point'
    coordinates: [number, number]
  }
}

const workerProfileSchema = new Schema<WorkerProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    categoryId: { type: String, required: true, trim: true, index: true },
    skills: [{ type: String, trim: true, index: true }],
    bio: { type: String, trim: true, maxlength: 1000 },
    experienceYears: { type: Number, default: 0, min: 0 },
    pricePerDay: { type: Number, required: true, min: 0, index: true },
    isAvailable: { type: Boolean, default: true, index: true },
    documents: [
      {
        type: {
          type: String,
          enum: ['aadhaar', 'photo', 'certificate', 'other'],
          required: true,
        },
        url: { type: String, required: true, trim: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0, min: 0 },
    },
    totalJobs: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true, versionKey: false },
)

workerProfileSchema.index({ location: '2dsphere' })
workerProfileSchema.index({ skills: 'text', bio: 'text', categoryId: 'text' })

export const WorkerProfileModel = mongoose.model<WorkerProfileDocument>(
  'WorkerProfile',
  workerProfileSchema,
)
