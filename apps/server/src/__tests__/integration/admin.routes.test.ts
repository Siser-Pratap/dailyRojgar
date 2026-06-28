import request from 'supertest'
import { createApp } from '../../app'
import * as adminService from '../../services/admin.service'

jest.mock('../../services/admin.service', () => ({
  getAdminDashboard: jest.fn(),
  getAdminUsers: jest.fn(),
  getAdminWorkerQueue: jest.fn(),
  getAdminWorkerDetail: jest.fn(),
  updateWorkerVerification: jest.fn(),
  reviewWorkerDocument: jest.fn(),
  getAdminBookingLedger: jest.fn(),
  getAdminPaymentLedger: jest.fn(),
  getDisputeQueue: jest.fn(),
  resolveDispute: jest.fn(),
}))

jest.mock('../../middleware/auth.middleware', () => {
  const { ApiError } = require('../../utils/ApiError')
  return {
    authenticate: (req: any, _res: any, next: any) => {
      req.user = {
        sub: req.headers['x-test-user'] ?? 'admin-1',
        role: req.headers['x-test-role'] ?? 'admin',
        iat: 1,
        exp: 9999999999,
      }
      next()
    },
    authorize:
      (...roles: string[]) =>
      (req: any, _res: any, next: any) => {
        if (!roles.includes(req.user.role))
          return next(ApiError.forbidden('Insufficient permissions'))
        next()
      },
  }
})

describe('admin routes integration', () => {
  const app = createApp()

  beforeEach(() => jest.clearAllMocks())

  it('blocks non-admins from the admin namespace', async () => {
    const res = await request(app).get('/api/admin/dashboard').set('x-test-role', 'customer')

    expect(res.status).toBe(403)
    expect(adminService.getAdminDashboard).not.toHaveBeenCalled()
  })

  it('returns the dashboard metrics for an admin', async () => {
    ;(adminService.getAdminDashboard as jest.Mock).mockResolvedValue({ users: 10, revenue: 1000 })

    const res = await request(app).get('/api/admin/dashboard')

    expect(res.status).toBe(200)
    expect(res.body.data.users).toBe(10)
  })

  it('approves worker verification', async () => {
    ;(adminService.updateWorkerVerification as jest.Mock).mockResolvedValue({
      verificationStatus: 'approved',
    })

    const res = await request(app)
      .patch('/api/admin/workers/worker-1/verification')
      .send({ status: 'approved' })

    expect(res.status).toBe(200)
    expect(adminService.updateWorkerVerification).toHaveBeenCalledWith(
      'worker-1',
      'admin-1',
      expect.objectContaining({ status: 'approved' }),
    )
  })

  it('validates the verification decision payload', async () => {
    const res = await request(app)
      .patch('/api/admin/workers/worker-1/verification')
      .send({ status: 'maybe' })

    expect(res.status).toBe(422)
    expect(adminService.updateWorkerVerification).not.toHaveBeenCalled()
  })

  it('reviews a worker document', async () => {
    ;(adminService.reviewWorkerDocument as jest.Mock).mockResolvedValue({ _id: 'p1' })

    const res = await request(app)
      .patch('/api/admin/workers/worker-1/documents/doc-1')
      .send({ status: 'approved' })

    expect(res.status).toBe(200)
    expect(adminService.reviewWorkerDocument).toHaveBeenCalledWith(
      'worker-1',
      'doc-1',
      'approved',
      'admin-1',
      undefined,
    )
  })

  it('resolves a dispute', async () => {
    ;(adminService.resolveDispute as jest.Mock).mockResolvedValue({ booking: {} })

    const res = await request(app)
      .patch('/api/admin/disputes/booking-1')
      .send({ resolution: 'customer', notes: 'Resolved' })

    expect(res.status).toBe(200)
    expect(adminService.resolveDispute).toHaveBeenCalledWith(
      'booking-1',
      'admin-1',
      expect.objectContaining({ resolution: 'customer' }),
    )
  })
})
