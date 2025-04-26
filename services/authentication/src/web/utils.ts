import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

export function setError<
  E extends { name: string; message: string; details?: unknown },
  S extends StatusCode,
>(c: Context, error: E, statusCode: S) {
  return c.json<{ success: false; error: E & { statusCode: S } }, S>(
    {
      success: false,
      error: {
        name: error.name,
        message: error.message,
        statusCode,
        ...(error.details !== undefined ? { details: error.details } : {}),
      } as E & { statusCode: S },
    } as const,
    statusCode,
  )
}

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}
