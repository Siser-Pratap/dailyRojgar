import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import {
  getDynamicPriceRecommendation,
  getProfileAssistantSuggestions,
  getSmartWorkerMatches,
} from '../services/ai.service'

export const AiController = {
  smartMatches: asyncHandler(async (req: Request, res: Response) => {
    const result = await getSmartWorkerMatches(req.query)
    return ApiResponse.success(res, {
      message: 'Smart worker matches fetched successfully',
      data: result,
    })
  }),

  priceRecommendation: asyncHandler(async (req: Request, res: Response) => {
    const result = await getDynamicPriceRecommendation(req.body)
    return ApiResponse.success(res, {
      message: 'Price recommendation generated successfully',
      data: result,
    })
  }),

  profileAssistant: asyncHandler(async (req: Request, res: Response) => {
    const result = await getProfileAssistantSuggestions(req.body)
    return ApiResponse.success(res, {
      message: 'Profile suggestions generated successfully',
      data: result,
    })
  }),
}
