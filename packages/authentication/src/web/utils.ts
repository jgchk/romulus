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
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    } as const,
    statusCode,
  )
}
