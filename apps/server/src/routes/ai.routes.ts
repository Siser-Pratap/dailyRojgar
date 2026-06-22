import { Router } from 'express'
import { AiController } from '../controllers/ai.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  priceRecommendationSchema,
  profileAssistantSchema,
  smartMatchQuerySchema,
} from '../validators/ai.validator'

const router = Router()

router.get('/matches/workers', validate(smartMatchQuerySchema, 'query'), AiController.smartMatches)
router.post(
  '/price-recommendation',
  authenticate,
  authorize('worker', 'admin'),
  validate(priceRecommendationSchema),
  AiController.priceRecommendation,
)
router.post(
  '/assistant/profile-suggestions',
  authenticate,
  authorize('worker', 'admin'),
  validate(profileAssistantSchema),
  AiController.profileAssistant,
)

export default router
