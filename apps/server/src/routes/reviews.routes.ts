import { Router } from 'express'
import { ReviewController } from '../controllers/review.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createReviewSchema,
  replyReviewSchema,
  reviewIdParamSchema,
  workerReviewsParamSchema,
} from '../validators/review.validator'

const router = Router()

router.post(
  '/',
  authenticate,
  authorize('customer'),
  validate(createReviewSchema),
  ReviewController.create,
)
router.get(
  '/worker/:workerId',
  validate(workerReviewsParamSchema, 'params'),
  ReviewController.workerReviews,
)
router.post(
  '/:id/reply',
  authenticate,
  authorize('worker'),
  validate(reviewIdParamSchema, 'params'),
  validate(replyReviewSchema),
  ReviewController.reply,
)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(reviewIdParamSchema, 'params'),
  ReviewController.remove,
)

export default router
