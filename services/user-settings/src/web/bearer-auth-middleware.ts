import type { IAuthenticationClient } from '@romulus/authentication/client'
import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/user-settings'
import { setError } from './utils'

export const bearerAuth = (
  getAuthenticationClient: (sessionToken: string) => IAuthenticationClient,
) =>
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

    const userResponse = await getAuthenticationClient(token).whoami()
    if (userResponse.isErr()) {
      return setError(c, userResponse.error, 401)
    }

    c.set('user', { id: userResponse.value.account.id })

    await next()
  })
