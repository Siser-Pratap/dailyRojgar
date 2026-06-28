import request from 'supertest'
import { createApp } from '../../app'
import * as chatService from '../../services/chat.service'
import { ApiError } from '../../utils/ApiError'

jest.mock('../../services/chat.service', () => ({
  resolveParticipantChat: jest.fn(),
  createChatForBooking: jest.fn(),
  sendChatMessage: jest.fn(),
  markChatMessageRead: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { sub: 'user-1', role: 'customer', iat: 1, exp: 9999999999 }
    next()
  },
  authorize: () => (_req: any, _res: any, next: any) => next(),
}))

describe('chat routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('returns chat history for a participant', async () => {
    ;(chatService.resolveParticipantChat as jest.Mock).mockResolvedValue({
      _id: 'chat-1',
      bookingId: 'booking-1',
      messages: [{ _id: 'm1', text: 'hi' }],
    })

    const res = await request(app).get('/api/chats/booking-1')

    expect(res.status).toBe(200)
    expect(res.body.data.messages).toHaveLength(1)
    expect(chatService.resolveParticipantChat).toHaveBeenCalledWith('booking-1', 'user-1')
  })

  it('forbids a non-participant', async () => {
    ;(chatService.resolveParticipantChat as jest.Mock).mockRejectedValue(
      ApiError.forbidden('You do not have access to this chat'),
    )

    const res = await request(app).get('/api/chats/booking-1')

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })
})
