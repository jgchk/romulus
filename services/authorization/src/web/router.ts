import { Hono } from 'hono'
import { z } from 'zod'

import type { AuthorizationApplication } from '../application'
import type { IAuthenticationService } from '../domain/authentication'
import {
  CustomError,
  DuplicatePermissionError,
  PermissionNotFoundError,
  RoleNotFoundError,
  UnauthorizedError,
} from '../domain/authorizer'
import { bearerAuth } from './bearer-auth-middleware'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createAuthorizationRouter>

const permissionSchema = z.object({ name: z.string().min(1), description: z.string().optional() })
const roleSchema = z.object({
  name: z.string().min(1),
  permissions: z.string().array(),
  description: z.string().optional(),
})

class UnknownError extends CustomError {
  constructor() {
    super('UnknownError', 'An unknown error occurred')
  }
}

export function createAuthorizationRouter(deps: AuthorizationRouterDependencies) {
  const requireUser = bearerAuth(deps.authentication())

  const app = new Hono()
    .post(
      '/permissions',
      zodValidator(
        'json',
        z.object({
          permission: permissionSchema,
        }),
      ),
      requireUser,
      async (c) => {
        const permission = c.req.valid('json').permission

        const result = await deps
          .application()
          .createPermission(permission.name, permission.description, c.var.user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else if (err instanceof DuplicatePermissionError) {
              return setError(c, err, 400)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .put(
      '/permissions',
      zodValidator(
        'json',
        z.object({
          permissions: permissionSchema.array(),
        }),
      ),
      requireUser,
      async (c) => {
        const permissions = c.req.valid('json').permissions

        const result = await deps.application().ensurePermissions(
          permissions.map((p) => ({ name: p.name, description: p.description })),
          c.var.user.id,
        )

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .delete(
      '/permissions/:name',
      zodValidator('param', z.object({ name: z.string() })),
      requireUser,
      async (c) => {
        const name = c.req.valid('param').name

        const result = await deps.application().deletePermission(name, c.var.user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .post(
      '/roles',
      zodValidator('json', z.object({ role: roleSchema })),
      requireUser,
      async (c) => {
        const role = c.req.valid('json').role

        const result = await deps
          .application()
          .createRole(role.name, new Set(role.permissions), role.description, c.var.user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else if (err instanceof PermissionNotFoundError) {
              return setError(c, err, 400)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .delete(
      '/roles/:name',
      zodValidator('param', z.object({ name: z.string() })),
      requireUser,
      async (c) => {
        const name = c.req.valid('param').name

        const result = await deps.application().deleteRole(name, c.var.user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .put(
      '/users/:id/roles',
      zodValidator('param', z.object({ id: z.coerce.number().int() })),
      zodValidator('json', z.object({ name: z.string() })),
      requireUser,
      async (c) => {
        const id = c.req.valid('param').id
        const name = c.req.valid('json').name

        const result = await deps.application().assignRoleToUser(id, name, c.var.user.id)

        return result.match(
          () => c.json({ success: true } as const),
          (err) => {
            if (err instanceof UnauthorizedError) {
              return setError(c, err, 403)
            } else if (err instanceof RoleNotFoundError) {
              return setError(c, err, 400)
            } else {
              err satisfies never
              return setError(c, new UnknownError(), 500)
            }
          },
        )
      },
    )

    .get(
      '/me/permissions/:permission',
      zodValidator('param', z.object({ permission: z.string() })),
      requireUser,
      async (c) => {
        const { permission } = c.req.valid('param')

        const result = await deps.application().checkMyPermission(permission, c.var.user.id)

        return c.json({ success: true, hasPermission: result } as const)
      },
    )

    .get('/me/permissions', requireUser, async (c) => {
      const result = await deps.application().getMyPermissions(c.var.user.id)

      return result.match(
        (permissions) => c.json({ success: true, permissions: [...permissions] } as const),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return setError(c, err, 403)
          } else {
            err satisfies never
            return setError(c, new UnknownError(), 500)
          }
        },
      )
    })

  return app
}

export type AuthorizationRouterDependencies = {
  application(): AuthorizationApplication
  authentication(): IAuthenticationService
}
