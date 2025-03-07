import { CustomError } from '@romulus/custom-error'
import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export function setError(
  c: Context,
  error: { name: string; message: string; details?: unknown },
  statusCode: StatusCode,
) {
  return c.json(
    {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        statusCode,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    } as const,
    statusCode,
  )
}

export class UnknownError extends CustomError {
  constructor() {
    super('UnknownError', 'An unknown error occurred')
  }
}

export class FetchError extends CustomError {
  constructor(public override readonly cause: Error) {
    super('FetchError', `An error occurred while fetching: ${cause.message}`, cause)
  }
}
