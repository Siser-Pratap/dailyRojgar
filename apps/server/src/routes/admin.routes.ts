import { Router } from 'express'
import { z } from 'zod'
import { AdminController } from '../controllers/admin.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  disputeDecisionSchema,
  documentDecisionSchema,
  moderationIdParamSchema,
} from '../validators/admin.validator'

const router = Router()

router.use(authenticate, authorize('admin'))

router.get('/dashboard', AdminController.dashboard)
router.patch(
  '/workers/:workerId/documents/:documentId',
  validate(z.object({ workerId: z.string().min(1), documentId: z.string().min(1) }), 'params'),
  validate(documentDecisionSchema),
  AdminController.reviewDocument,
)
router.patch(
  '/disputes/:id',
  validate(moderationIdParamSchema, 'params'),
  validate(disputeDecisionSchema),
  AdminController.resolveDispute,
)

export default router
