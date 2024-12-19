import { createMiddleware } from 'hono/factory'

import { UnauthorizedError } from '../domain/authorizer'
import { SYSTEM_USER_ID } from '../domain/permissions'
import { env } from '../env'
import { setError } from './utils'
import { IAuthenticationClient } from '@romulus/authentication'

export function bearerAuth(
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

    if (token === env.SYSTEM_USER_TOKEN) {
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
