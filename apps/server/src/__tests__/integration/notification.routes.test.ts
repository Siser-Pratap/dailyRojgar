import request from 'supertest'
import { createApp } from '../../app'
import * as notificationService from '../../services/notification.service'

jest.mock('../../services/notification.service', () => ({
  listMyNotifications: jest.fn(),
  markAllNotificationsRead: jest.fn(),
  markNotificationRead: jest.fn(),
  registerFcmToken: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { sub: 'user-1', role: 'customer', iat: 1, exp: 9999999999 }
    next()
  },
  authorize: () => (_req: any, _res: any, next: any) => next(),
}))

describe('notification routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('lists notifications with pagination meta', async () => {
    ;(notificationService.listMyNotifications as jest.Mock).mockResolvedValue({
      items: [{ _id: 'n1', title: 'Hi' }],
      total: 1,
      page: 1,
      limit: 20,
    })

    const res = await request(app).get('/api/notifications')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.meta.total).toBe(1)
    expect(notificationService.listMyNotifications).toHaveBeenCalledWith(
      'user-1',
      expect.any(Object),
    )
  })

  it('passes unreadOnly=true through to the service as a boolean', async () => {
    ;(notificationService.listMyNotifications as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    })

    await request(app).get('/api/notifications').query({ unreadOnly: 'true' })

    expect(notificationService.listMyNotifications).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ unreadOnly: true }),
    )
  })

  it('marks a single notification read', async () => {
    ;(notificationService.markNotificationRead as jest.Mock).mockResolvedValue({ _id: 'n1' })

    const res = await request(app).patch('/api/notifications/n1/read')

    expect(res.status).toBe(200)
    expect(notificationService.markNotificationRead).toHaveBeenCalledWith('user-1', 'n1')
  })

  it('marks all notifications read', async () => {
    ;(notificationService.markAllNotificationsRead as jest.Mock).mockResolvedValue({
      modifiedCount: 3,
    })

    const res = await request(app).patch('/api/notifications/read-all')

    expect(res.status).toBe(200)
    expect(res.body.data.modifiedCount).toBe(3)
  })
})
