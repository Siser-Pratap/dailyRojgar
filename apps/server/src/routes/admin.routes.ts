import { Router } from 'express'
import { AdminController } from '../controllers/admin.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  adminListQuerySchema,
  adminWorkerDocumentParamSchema,
  adminWorkerParamSchema,
  disputeDecisionSchema,
  documentDecisionSchema,
  moderationIdParamSchema,
  workerVerificationDecisionSchema,
} from '../validators/admin.validator'

const router = Router()

router.use(authenticate, authorize('admin'))

router.get('/dashboard', AdminController.dashboard)
router.get('/users', validate(adminListQuerySchema, 'query'), AdminController.users)
router.get('/workers', validate(adminListQuerySchema, 'query'), AdminController.workers)
router.get(
  '/workers/:workerId',
  validate(adminWorkerParamSchema, 'params'),
  AdminController.workerDetail,
)
router.patch(
  '/workers/:workerId/verification',
  validate(adminWorkerParamSchema, 'params'),
  validate(workerVerificationDecisionSchema),
  AdminController.updateWorkerVerification,
)
router.patch(
  '/workers/:workerId/documents/:documentId',
  validate(adminWorkerDocumentParamSchema, 'params'),
  validate(documentDecisionSchema),
  AdminController.reviewDocument,
)
router.get('/bookings', validate(adminListQuerySchema, 'query'), AdminController.bookings)
router.get('/payments', validate(adminListQuerySchema, 'query'), AdminController.payments)
router.get('/reports', validate(adminListQuerySchema, 'query'), AdminController.disputes)
router.patch(
  '/disputes/:id',
  validate(moderationIdParamSchema, 'params'),
  validate(disputeDecisionSchema),
  AdminController.resolveDispute,
)

export default router
