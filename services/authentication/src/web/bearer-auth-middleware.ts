import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/errors/unauthorized'
import { setError } from './utils'

export const bearerAuth = createMiddleware<{
  Variables: {
    token: string
  }
}>(async (c, next) => {
  const token = getBearerAuthToken(c)

  if (token === undefined) {
    return setError(c, new UnauthorizedError(), 401)
  }

  c.set('token', token)

  await next()
})

export function getBearerAuthToken(c: Context): string | undefined {
  const header = c.req.header('Authorization')
  if (!header) return

  const token = header.split(' ').at(1)
  if (!token) return

  return token
}
