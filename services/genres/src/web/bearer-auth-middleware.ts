import { createMiddleware } from 'hono/factory'

import type { IAuthenticationService } from '../domain/authentication'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import { setError } from './utils'

export function bearerAuth(authentication: IAuthenticationService) {
  return createMiddleware<{
    Variables: {
      token: string
      user: { id: number }
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

    const userResponse = await authentication.whoami(token)
    if (userResponse.isErr()) {
      return setError(c, userResponse.error, 401)
    }

    c.set('user', { id: userResponse.value.id })

    await next()
  })
}
