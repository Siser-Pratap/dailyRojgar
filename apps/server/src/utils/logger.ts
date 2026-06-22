import winston from 'winston'
import path from 'path'
import fs from 'fs'

const { combine, timestamp, errors, json } = winston.format

const logDir = path.join(process.cwd(), 'logs')
fs.mkdirSync(logDir, { recursive: true })

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    errors({ stack: true }),
    json(),
  ),
  defaultMeta: { service: 'api' },
  transports: [
    // Console — pretty in dev, JSON in prod
    new winston.transports.Console({
      format: combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), json()),
    }),
    // Rotate-worthy file transport
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
    }),
  ],
})

// Stream for Morgan
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim())
  },
}
