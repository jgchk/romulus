import type { Context, TypedResponse } from 'hono'
import { createMiddleware } from 'hono/factory'

import type { IAuthenticationService } from '../domain/authentication.js'
import type { unauthenticatedErrorResponse } from './errors.js'

export function createBearerAuthMiddleware(authentication: IAuthenticationService) {
  return createMiddleware<{
    Variables: {
      token: string
      user: { id: number }
    }
  }>(async (c, next) => {
    const token = getBearerAuthToken(c)

    if (token === undefined) {
      return sendUnauthenticatedError(c)
    }

    c.set('token', token)

    const userResponse = await authentication.whoami(token)
    if (userResponse.isErr()) {
      return sendUnauthenticatedError(c)
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

function sendUnauthenticatedError(
  c: Context<
    {
      Variables: {
        token: string
        user: { id: number }
      }
    },
    string,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {}
  >,
): Response &
  TypedResponse<
    typeof unauthenticatedErrorResponse.infer,
    (typeof unauthenticatedErrorResponse.infer)['error']['statusCode']
  > {
  return c.json(
    {
      success: false,
      error: {
        name: 'UnauthenticatedError',
        message: 'You are not authenticated',
        statusCode: 401,
      },
    },
    401,
  )
}
