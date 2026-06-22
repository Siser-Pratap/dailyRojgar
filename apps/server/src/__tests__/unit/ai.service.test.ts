import {
  getDynamicPriceRecommendation,
  getProfileAssistantSuggestions,
  getSmartWorkerMatches,
} from '../../services/ai.service'
import { BookingModel } from '../../models/Booking.model'
import { WorkerProfileModel } from '../../models/WorkerProfile.model'

jest.mock('../../models/Booking.model', () => ({
  BookingModel: { countDocuments: jest.fn() },
}))

jest.mock('../../models/WorkerProfile.model', () => ({
  WorkerProfileModel: { countDocuments: jest.fn(), find: jest.fn() },
}))

describe('AI service rule-based features', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns profile assistant suggestions for weak profiles', () => {
    const result = getProfileAssistantSuggestions({
      bio: 'Good worker',
      skills: ['Wiring'],
      categoryId: 'Electrical',
      pricePerDay: 1500,
    })

    expect(result.assistant).toBe('rule-based-profile-assistant-v1')
    expect(result.suggestions.map((item) => item.type)).toContain('profile_improvement')
    expect(result.suggestions.map((item) => item.type)).toContain('skill_gap')
    expect(result.nextBestAction).toBeTruthy()
  })

  it('calculates dynamic price recommendation using supply demand factors', async () => {
    ;(WorkerProfileModel.countDocuments as jest.Mock).mockResolvedValue(4)
    ;(BookingModel.countDocuments as jest.Mock).mockResolvedValue(6)

    const result = await getDynamicPriceRecommendation({
      categoryId: 'Electrical',
      pincode: '110001',
      scheduledAt: new Date('2026-06-27T09:00:00.000Z'),
      estimatedHours: 8,
    })

    expect(result.baseline).toBe(850)
    expect(result.suggestedRange.min).toBeLessThan(result.suggestedRange.max)
    expect(result.factors.availableWorkers).toBe(4)
    expect(result.factors.demandBookings).toBe(6)
  })

  it('sorts smart worker matches by weighted score', async () => {
    const execLean = jest.fn().mockResolvedValue([
      {
        _id: 'far-good',
        categoryId: 'Electrical',
        isAvailable: true,
        totalJobs: 100,
        rating: { average: 5, totalReviews: 20 },
        location: { coordinates: [77.4, 28.8] },
      },
      {
        _id: 'near-ok',
        categoryId: 'Electrical',
        isAvailable: true,
        totalJobs: 50,
        rating: { average: 4, totalReviews: 8 },
        location: { coordinates: [77.21, 28.614] },
      },
    ])
    ;(WorkerProfileModel.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: execLean,
    })

    const result = await getSmartWorkerMatches({
      categoryId: 'Electrical',
      lat: 28.6139,
      lng: 77.209,
      radius: 100,
    })

    expect(result.algorithm).toBe('rule-based-v1')
    expect(result.items[0]._id).toBe('near-ok')
    expect(result.items[0].smartMatch.score).toBeGreaterThan(result.items[1].smartMatch.score)
  })
})
