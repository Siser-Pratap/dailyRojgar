import mongoose from 'mongoose'
import { env } from './env'
import { logger } from '../utils/logger'

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true)

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
