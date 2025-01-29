import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

import type { IAuthenticationService } from '../domain/authentication.js'
import { CustomError } from '../domain/authorizer.js'
import { setError } from './utils.js'

export function bearerAuth(authentication: IAuthenticationService) {
  return createMiddleware<{
    Variables: {
      token: string
      user: { id: number }
    }
  }>(async (c, next) => {
    const token = getBearerAuthToken(c)

    if (token === undefined) {
      return setError(c, new UnauthenticatedError(), 401)
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

export function getBearerAuthToken(c: Context): string | undefined {
  const header = c.req.header('Authorization')
  if (!header) return

  const token = header.split(' ').at(1)
  if (!token) return

  return token
}

export class UnauthenticatedError extends CustomError {
  constructor() {
    super('UnauthenticatedError', 'You are not authenticated')
  }
}
