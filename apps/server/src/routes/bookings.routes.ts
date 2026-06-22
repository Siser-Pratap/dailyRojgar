import { Router } from 'express'
import { BookingController } from '../controllers/booking.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  bookingIdParamSchema,
  bookingsQuerySchema,
  cancelBookingSchema,
  createBookingSchema,
  disputeBookingSchema,
  rejectBookingSchema,
} from '../validators/booking.validator'

const router = Router()

router.use(authenticate)

router.post('/', authorize('customer'), validate(createBookingSchema), BookingController.create)
router.get('/', validate(bookingsQuerySchema, 'query'), BookingController.list)
router.get('/:id', validate(bookingIdParamSchema, 'params'), BookingController.detail)
router.patch(
  '/:id/accept',
  authorize('worker'),
  validate(bookingIdParamSchema, 'params'),
  BookingController.accept,
)
router.patch(
  '/:id/reject',
  authorize('worker'),
  validate(bookingIdParamSchema, 'params'),
  validate(rejectBookingSchema),
  BookingController.reject,
)
router.patch(
  '/:id/start',
  authorize('worker'),
  validate(bookingIdParamSchema, 'params'),
  BookingController.start,
)
router.patch(
  '/:id/complete',
  authorize('worker'),
  validate(bookingIdParamSchema, 'params'),
  BookingController.complete,
)
router.patch(
  '/:id/cancel',
  validate(bookingIdParamSchema, 'params'),
  validate(cancelBookingSchema),
  BookingController.cancel,
)
router.post(
  '/:id/dispute',
  authorize('customer'),
  validate(bookingIdParamSchema, 'params'),
  validate(disputeBookingSchema),
  BookingController.dispute,
)

export default router
