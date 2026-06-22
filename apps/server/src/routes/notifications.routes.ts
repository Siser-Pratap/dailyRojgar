import { Router } from 'express'
import { NotificationController } from '../controllers/notification.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  notificationIdParamSchema,
  notificationsQuerySchema,
} from '../validators/notification.validator'

const router = Router()

router.use(authenticate)

router.get('/', validate(notificationsQuerySchema, 'query'), NotificationController.list)
router.patch('/read-all', NotificationController.readAll)
router.patch(
  '/:id/read',
  validate(notificationIdParamSchema, 'params'),
  NotificationController.readOne,
)

export default router
