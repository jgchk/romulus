import type { IAuthenticationApplication } from '@romulus/authentication'
import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/authorizer'
import { setError } from './utils'

export const bearerAuth = (authentication: IAuthenticationApplication) =>
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
    if (userResponse instanceof Error) {
      return setError(c, userResponse, 401)
    }

    c.set('user', userResponse.account)

    await next()
  })
