import { Router } from 'express'
import { WorkerController } from '../controllers/worker.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  availabilitySchema,
  listWorkersQuerySchema,
  upsertWorkerProfileSchema,
  workerDocumentSchema,
  workerIdParamSchema,
} from '../validators/worker.validator'

const router = Router()

router.post(
  '/profile',
  authenticate,
  authorize('worker'),
  validate(upsertWorkerProfileSchema),
  WorkerController.upsertProfile,
)
router.patch(
  '/availability',
  authenticate,
  authorize('worker'),
  validate(availabilitySchema),
  WorkerController.availability,
)
router.post(
  '/documents',
  authenticate,
  authorize('worker'),
  validate(workerDocumentSchema),
  WorkerController.documents,
)
router.get('/me/stats', authenticate, authorize('worker'), WorkerController.stats)
router.get('/me/jobs', authenticate, authorize('worker'), WorkerController.jobs)
router.get('/', validate(listWorkersQuerySchema, 'query'), WorkerController.list)
router.get('/:id', validate(workerIdParamSchema, 'params'), WorkerController.detail)

export default router
