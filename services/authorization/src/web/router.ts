import { Hono } from 'hono'
import { z } from 'zod'

import { UnauthorizedError } from '../domain/authorizer'
import { bearerAuth } from './bearer-auth-middleware'
import type { CompositionRoot } from './composition-root'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createRouter>

export function createRouter(di: CompositionRoot) {
  const requireUser = bearerAuth(di.authentication())

  const app = new Hono().get(
    '/users/:id/permissions',
    zodValidator(
      'param',
      z.object({
        id: z.coerce.number().int(),
      }),
    ),
    requireUser,
    async (c) => {
      const id = c.req.valid('param').id

      const permissions = await di.application().getPermissions(id, c.var.user.id)
      if (permissions instanceof UnauthorizedError) {
        return setError(c, permissions, 403)
      }

      return c.json({
        success: true,
        permissions: [...permissions],
      } as const)
    },
  )

  return app
}
