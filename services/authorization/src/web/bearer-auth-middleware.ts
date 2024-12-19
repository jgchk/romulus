import type { IAuthenticationClient } from '@romulus/authentication/client'
import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/authorizer'
import { SYSTEM_USER_ID } from '../domain/permissions'
import { setError } from './utils'

export function bearerAuth(
  systemUserToken: string,
  getAuthenticationClient: (sessionToken: string) => IAuthenticationClient,
) {
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

    if (token === systemUserToken) {
      c.set('user', { id: SYSTEM_USER_ID })
    } else {
      const userResponse = await getAuthenticationClient(token).whoami()
      if (userResponse.isErr()) {
        return setError(c, userResponse.error, 401)
      }

      c.set('user', { id: userResponse.value.account.id })
    }

    await next()
  })
}
