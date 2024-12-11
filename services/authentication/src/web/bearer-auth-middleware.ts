import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/errors/unauthorized'
import { setError } from './utils'

export const bearerAuth = createMiddleware<{
  Variables: {
    token: string
  }
}>(async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header) {
    return setError(c, new UnauthorizedError(), 401)
  }

  const token = header.split(' ').at(1)
  if (!token) {
    return setError(c, new UnauthorizedError(), 401)
  }

  c.set('token', token)

  await next()
})
