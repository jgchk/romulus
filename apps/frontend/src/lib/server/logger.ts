import { type RequestEvent } from '@sveltejs/kit'
import { pino } from 'pino'

export type Logger = {
  http(data: {
    requestId: string
    request: Request
    response: Response
    startTime: number
    endTime: number
  }): void

  error(data: {
    error: unknown
    event: RequestEvent<Partial<Record<string, string>>, string | null>
    status: number
    message: string
  }): void
}

export function createLogger(): Logger {
  const logger = pino()

  return {
    http({ requestId, request, response, startTime, endTime }) {
      logger.info({
        req: {
          id: requestId,
          method: request.method,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        },
        res: {
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        },
        responseTime: endTime - startTime,
        msg: 'request completed',
      })
    },

    error({ error, event, status, message }) {
      logger.error({
        error,
        event,
        status,
        message,
      })
    },
  }
}
