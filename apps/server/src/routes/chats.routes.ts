import { Router } from 'express'
import { ChatController } from '../controllers/chat.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { chatBookingParamSchema } from '../validators/chat.validator'

const router = Router()

router.use(authenticate)

router.get('/:bookingId', validate(chatBookingParamSchema, 'params'), ChatController.byBooking)

export default router
