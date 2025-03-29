import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'

import type { IAuthorizationService } from '../domain/authorization.js'
import type { routes } from './routes.js'

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
): void | Response | PromiseLike<void | Response> {
  return c.json(
    {
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'You are not authorized',
        statusCode: 403,
      },
    } satisfies typeof routes.unauthorizedErrorResponse.infer,
    403,
  )
}
