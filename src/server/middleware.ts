import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { ApiError } from 'next/dist/server/api-utils'

const getExceptionStatus = (exception: unknown) =>
  exception instanceof ApiError ? exception.statusCode : 500

const getExceptionMessage = (exception: unknown) =>
  isError(exception) ? exception.message : `Internal Server Error`

const getExceptionStack = (exception: unknown) =>
  isError(exception) ? exception.stack : undefined

const isError = (exception: unknown): exception is Error =>
  exception instanceof Error

export const withExceptionFilter =
  (req: NextApiRequest, res: NextApiResponse) =>
  async (handler: NextApiHandler) => {
    try {
      await handler(req, res)
    } catch (error) {
      const statusCode = getExceptionStatus(error)
      const message = getExceptionMessage(error)
      const stack = getExceptionStack(error)

      const timestamp = new Date().toISOString()

      // return just enough information without leaking any data
      const responseBody = {
        statusCode,
        message,
        stack,
        timestamp,
        path: req.url,
      }

      return res.status(statusCode).send(responseBody)
    }
  }
