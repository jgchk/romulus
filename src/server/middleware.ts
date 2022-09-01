import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

import { env } from './env'

const getExceptionStatus = (exception: unknown) =>
  exception instanceof ApiError ? exception.statusCode : 500

const getExceptionMessage = (exception: unknown) =>
  isError(exception) ? exception.message : `Internal Server Error`

const getExceptionStack = (exception: unknown) =>
  isError(exception) ? exception.stack : undefined

const isError = (exception: unknown): exception is Error =>
  exception instanceof Error

type ErrorResponse = {
  statusCode: number
  message: string
  stack?: string
  timestamp: string
  path?: string
}

export const withExceptionFilter =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res)
    } catch (error) {
      const statusCode = getExceptionStatus(error)
      const message = getExceptionMessage(error)

      const timestamp = new Date().toISOString()

      // return just enough information without leaking any data
      const responseBody: ErrorResponse = {
        statusCode,
        message,
        timestamp,
        path: req.url,
      }

      if (env.NODE_ENV !== 'production') {
        const stack = getExceptionStack(error)
        responseBody.stack = stack
      }

      return res.status(statusCode).send(responseBody)
    }
  }
