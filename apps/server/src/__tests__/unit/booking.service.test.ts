import { createBooking, getBookingDetail } from '../../services/booking.service'
import { BookingModel } from '../../models/Booking.model'
import { WorkerProfileModel } from '../../models/WorkerProfile.model'
import { createChatForBooking } from '../../services/chat.service'
import { dispatchNotificationEvent } from '../../services/notification.service'

jest.mock('../../models/Booking.model', () => ({
  BookingModel: { create: jest.fn(), findById: jest.fn() },
}))
jest.mock('../../models/WorkerProfile.model', () => ({
  WorkerProfileModel: { findOne: jest.fn() },
}))
jest.mock('../../services/chat.service', () => ({ createChatForBooking: jest.fn() }))
jest.mock('../../services/notification.service', () => ({ dispatchNotificationEvent: jest.fn() }))
jest.mock('../../sockets/socket.service', () => ({ emitBookingUpdate: jest.fn() }))

describe('booking service', () => {
  const customerId = '507f1f77bcf86cd799439011'
  const workerId = '507f1f77bcf86cd799439012'

  beforeEach(() => jest.clearAllMocks())

  it('creates booking with platform fee, chat, and worker notification', async () => {
    ;(WorkerProfileModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: 'profile-1',
        userId: workerId,
        isAvailable: true,
        location: { type: 'Point', coordinates: [77.2, 28.6] },
      }),
    })
    ;(BookingModel.create as jest.Mock).mockResolvedValue({
      _id: { toString: () => 'booking-1' },
      bookingNumber: 'DR-2026-000001',
      status: 'pending',
      toObject: () => ({ _id: 'booking-1', status: 'pending' }),
    })

    const result = await createBooking(customerId, {
      workerId,
      categoryId: 'Electrical',
      scheduledDate: new Date('2026-06-23T10:00:00.000Z'),
      durationDays: 1,
      amount: 1000,
      address: { city: 'Delhi' },
    })

    expect(BookingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ platformFee: 100, totalAmount: 1100, paymentStatus: 'unpaid' }),
    )
    expect(createChatForBooking).toHaveBeenCalledWith({
      bookingId: 'booking-1',
      customerId,
      workerId,
    })
    expect(dispatchNotificationEvent).toHaveBeenCalledWith(
      'booking.created',
      expect.objectContaining({ userId: workerId }),
    )
    expect(result).toEqual({ _id: 'booking-1', status: 'pending' })
  })

  it('rejects booking unavailable worker', async () => {
    ;(WorkerProfileModel.findOne as jest.Mock).mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: 'profile-1', isAvailable: false }),
    })

    await expect(
      createBooking(customerId, {
        workerId,
        categoryId: 'Electrical',
        scheduledDate: new Date(),
        durationDays: 1,
        amount: 1000,
      }),
    ).rejects.toMatchObject({ statusCode: 400 })
  })

  describe('getBookingDetail access check', () => {
    // The detail query populates customerId/workerId, so ownership must be
    // compared against the populated object's _id, not the object itself.
    const mockBooking = (booking: unknown) => {
      ;(BookingModel.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(booking),
      })
    }

    it('allows the owning customer when customerId is populated', async () => {
      const booking = {
        _id: 'booking-1',
        customerId: { _id: customerId, name: 'Asha' },
        workerId: { _id: workerId, name: 'Ravi' },
      }
      mockBooking(booking)

      await expect(getBookingDetail(customerId, 'customer', 'booking-1')).resolves.toEqual(booking)
    })

    it('forbids an unrelated user', async () => {
      mockBooking({
        _id: 'booking-1',
        customerId: { _id: customerId, name: 'Asha' },
        workerId: { _id: workerId, name: 'Ravi' },
      })

      await expect(
        getBookingDetail('507f1f77bcf86cd799439099', 'customer', 'booking-1'),
      ).rejects.toMatchObject({ statusCode: 403 })
    })

    it('throws 404 when the booking is missing', async () => {
      mockBooking(null)

      await expect(getBookingDetail(customerId, 'customer', 'missing')).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })
})
