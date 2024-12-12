import { createMiddleware } from 'hono/factory'

import type { IAuthenticationService } from '../domain/authentication-service'
import { UnauthorizedError } from '../domain/errors/unauthorized'
import { setError } from './utils'

export const bearerAuth = (authentication: IAuthenticationService) =>
  createMiddleware<{
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
    if (userResponse instanceof UnauthorizedError) {
      return setError(c, userResponse, 401)
    }

    c.set('user', userResponse.account)

    await next()
  })
