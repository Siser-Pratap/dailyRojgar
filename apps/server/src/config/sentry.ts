import * as Sentry from '@sentry/node'
import { env } from './env'
import { logger } from '../utils/logger'

const seenErrorTypes = new Set<string>()

export function initSentry() {
  if (!env.SENTRY_DSN) {
    logger.info('Sentry disabled: SENTRY_DSN is not configured')
    return
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1,
  })

  logger.info('Sentry initialized', { environment: env.NODE_ENV })
}

async function alertSlackOnNewError(errorType: string, message: string) {
  if (!env.SLACK_WEBHOOK_URL || seenErrorTypes.has(errorType)) return
  seenErrorTypes.add(errorType)

  try {
    await fetch(env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 dailyRojgar API new error type: ${errorType}\n${message}`,
      }),
    })
  } catch (error) {
    logger.warn('Slack error alert failed', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export function captureException(
  error: unknown,
  context: {
    requestId?: string
    userId?: string | null
    path?: string
    method?: string
    extra?: Record<string, unknown>
  } = {},
) {
  const err = error instanceof Error ? error : new Error(String(error))
  const errorType = err.name || 'UnknownError'

  if (env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context.requestId) scope.setTag('requestId', context.requestId)
      if (context.userId) scope.setUser({ id: context.userId })
      if (context.path) scope.setContext('request', { path: context.path, method: context.method })
      if (context.extra) scope.setExtras(context.extra)
      Sentry.captureException(err)
    })
  }

  void alertSlackOnNewError(errorType, err.message)
}
