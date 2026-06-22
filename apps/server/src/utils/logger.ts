import winston from 'winston'
import path from 'path'

const { combine, timestamp, errors, json, colorize, simple } = winston.format

const logDir = path.join(process.cwd(), 'logs')

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
      format:
        process.env.NODE_ENV === 'production'
          ? combine(timestamp(), json())
          : combine(colorize(), simple()),
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
