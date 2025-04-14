import type { Context, TypedResponse } from 'hono'
import { createMiddleware } from 'hono/factory'

import type { IAuthorizationService } from '../domain/authorization.js'
import type { unauthorizedErrorResponse } from './errors.js'

export type AuthorizationMiddleware = ReturnType<typeof createAuthorizationMiddleware>

export function createAuthorizationMiddleware(authorization: IAuthorizationService) {
  return function (permission: string) {
    return createMiddleware<{
      Variables: {
        token: string
        user: { id: number }
      }
    }>(async (c, next) => {
      const user = c.var.user

      const hasPermission = await authorization.hasPermission(user.id, permission)

      if (!hasPermission) {
        return sendUnauthorizedError(c)
      }

      await next()
    })
  }
}

function sendUnauthorizedError(
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
    typeof unauthorizedErrorResponse.infer,
    (typeof unauthorizedErrorResponse.infer)['error']['statusCode']
  > {
  return c.json(
    {
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized',
        statusCode: 403,
      },
    },
    403,
  )
}
