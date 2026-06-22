import Redis from 'ioredis'
import { env } from './env'
import { logger } from '../utils/logger'
import { recordRedisGet } from '../services/metrics.service'

let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
    })

    redisClient.on('connect', () => {
      logger.info('Redis connected')
    })

    redisClient.on('error', (err) => {
      logger.error('Redis error', { error: err.message })
    })

    redisClient.on('close', () => {
      logger.warn('Redis connection closed')
    })

    const originalGet = redisClient.get.bind(redisClient)
    redisClient.get = (async (...args: Parameters<Redis['get']>) => {
      const result = await originalGet(...args)
      recordRedisGet(result !== null)
      return result
    }) as Redis['get']
  }

  return redisClient
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient()
  await client.connect()
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    logger.info('Redis disconnected gracefully')
  }
}
