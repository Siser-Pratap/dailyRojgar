import { Request, Response } from 'express'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import { searchServices, searchWorkers } from '../services/search.service'

export const SearchController = {
  searchWorkers: asyncHandler(async (req: Request, res: Response) => {
    const result = await searchWorkers({
      q: req.query.q as string | undefined,
      lat: req.query.lat ? Number(req.query.lat) : undefined,
      lng: req.query.lng ? Number(req.query.lng) : undefined,
      radius: req.query.radius ? Number(req.query.radius) : undefined,
      categoryId: req.query.categoryId as string | undefined,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      availability: req.query.availability ? req.query.availability === 'true' : undefined,
      sortBy: (req.query.sortBy as 'rating' | 'price' | 'distance' | 'reviews') || 'rating',
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    })

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Workers fetched successfully',
      data: result.items,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    })
  }),

  searchServices: asyncHandler(async (req: Request, res: Response) => {
    const result = searchServices(req.query.q as string | undefined)

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Services fetched successfully',
      data: result,
    })
  }),
}
