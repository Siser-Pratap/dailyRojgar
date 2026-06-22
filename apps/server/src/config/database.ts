import mongoose from 'mongoose'
import { env } from './env'
import { logger } from '../utils/logger'
import { recordMongoQuery } from '../services/metrics.service'

let metricsPluginInstalled = false

function installMongooseMetricsPlugin() {
  if (metricsPluginInstalled) return
  metricsPluginInstalled = true

  mongoose.plugin((schema) => {
    schema.pre(/^find|count|update|delete|aggregate/, function startTimer() {
      ;(this as unknown as { __queryStart?: bigint }).__queryStart = process.hrtime.bigint()
    })

    schema.post(/^find|count|update|delete|aggregate/, function endTimer() {
      const query = this as unknown as {
        __queryStart?: bigint
        model?: { modelName?: string }
        op?: string
      }
      if (!query.__queryStart) return
      const durationMs = Number(process.hrtime.bigint() - query.__queryStart) / 1_000_000
      recordMongoQuery(query.model?.modelName ?? 'unknown', query.op ?? 'unknown', durationMs)
    })
  })
}

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true)
    installMongooseMetricsPlugin()

    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    logger.info('MongoDB connected', { host: mongoose.connection.host })

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message })
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — attempting reconnect')
    })
  } catch (error) {
    logger.error('MongoDB connection failed', { error })
    process.exit(1)
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.connection.close()
  logger.info('MongoDB disconnected gracefully')
}
