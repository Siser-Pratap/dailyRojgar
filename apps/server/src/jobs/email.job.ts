import nodemailer from 'nodemailer'
import { Job, Worker } from 'bullmq'
import { EmailJob, QUEUE_CONCURRENCY, buildRedisConnection } from '../queues'
import { UserModel } from '../models/User.model'
import { env } from '../config/env'
import { logger } from '../utils/logger'

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

async function processEmailJob(job: Job<EmailJob>) {
  const user = await UserModel.findById(job.data.userId).select('email name').lean()
  if (!user?.email) {
    logger.warn('Email job skipped: user email not found', {
      jobId: job.id,
      userId: job.data.userId,
    })
    return { skipped: true, reason: 'missing_email' }
  }

  const transporter = createTransporter()
  if (!transporter) {
    logger.info('Email job dry-run: SMTP is not configured', {
      to: user.email,
      subject: job.data.subject,
      userId: job.data.userId,
    })
    return { dryRun: true, to: user.email }
  }

  const result = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: user.email,
    subject: job.data.subject,
    text: job.data.text,
    html: job.data.html,
  })

  logger.info('Email sent', { jobId: job.id, messageId: result.messageId, to: user.email })
  return { messageId: result.messageId }
}

export function createEmailWorker() {
  const worker = new Worker<EmailJob>('email-queue', processEmailJob, {
    connection: buildRedisConnection(),
    concurrency: QUEUE_CONCURRENCY,
  })

  worker.on('failed', (job, err) => {
    logger.error('Email job failed', { jobId: job?.id, error: err.message })
  })

  return worker
}
