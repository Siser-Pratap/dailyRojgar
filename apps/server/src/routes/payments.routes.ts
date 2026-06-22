import { Router } from 'express'
import { PaymentController } from '../controllers/payment.controller'
import { authenticate, authorize } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import {
  createOrderSchema,
  paymentBookingParamSchema,
  paymentIdParamSchema,
  refundSchema,
  verifyPaymentSchema,
} from '../validators/payment.validator'

const router = Router()

router.post('/webhook', PaymentController.webhook)
router.post(
  '/create-order',
  authenticate,
  authorize('customer'),
  validate(createOrderSchema),
  PaymentController.createOrder,
)
router.post(
  '/verify',
  authenticate,
  authorize('customer'),
  validate(verifyPaymentSchema),
  PaymentController.verify,
)
router.get(
  '/:bookingId',
  authenticate,
  validate(paymentBookingParamSchema, 'params'),
  PaymentController.detail,
)
router.post(
  '/:id/refund',
  authenticate,
  authorize('admin'),
  validate(paymentIdParamSchema, 'params'),
  validate(refundSchema),
  PaymentController.refund,
)

export default router
