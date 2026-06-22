import http from 'http'
import { env } from './config/env'
import { createApp } from './app'
import { connectDatabase, disconnectDatabase } from './config/database'
import { connectRedis, disconnectRedis } from './config/redis'
import { logger } from './utils/logger'
import { initSockets } from './sockets'

async function bootstrap(): Promise<void> {
  // Connect to databases
  await connectDatabase()
  await connectRedis()

  const app = createApp()
  const server = http.createServer(app)

  // ─── Socket.io ───────────────────────────────────────────────────────────
  initSockets(server)

  server.listen(env.PORT, () => {
    logger.info(`Server running`, {
      port: env.PORT,
      env: env.NODE_ENV,
      url: `http://localhost:${env.PORT}`,
    })
  })

  // ─── Graceful shutdown ────────────────────────────────────────────────────
  async function shutdown(signal: string): Promise<void> {
    logger.info(`${signal} received — shutting down gracefully`)

    server.close(async () => {
      await disconnectDatabase()
      await disconnectRedis()
      logger.info('Shutdown complete')
      process.exit(0)
    })

    // Force exit after 10 seconds if graceful shutdown stalls
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason })
    // Don't crash in development; crash in production to let the process manager restart
    if (env.NODE_ENV === 'production') {
      process.exit(1)
    }
  })

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack })
    process.exit(1)
  })
}

bootstrap()
