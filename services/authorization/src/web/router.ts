import type { IAuthenticationClient } from '@romulus/authentication/client'
import { Hono } from 'hono'
import { z } from 'zod'

import {
  CustomError,
  DuplicatePermissionError,
  PermissionNotFoundError,
  RoleNotFoundError,
  UnauthorizedError,
} from '../domain/authorizer'
import { bearerAuth } from './bearer-auth-middleware'
import type { CompositionRoot } from './composition-root'
import { setError } from './utils'
import { zodValidator } from './zod-validator'

export type Router = ReturnType<typeof createRouter>

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

export function createRouter(
  di: CompositionRoot,
  systemUserToken: string,
  getAuthenticationClient: (sessionToken: string) => IAuthenticationClient,
) {
  const requireUser = bearerAuth(systemUserToken, getAuthenticationClient)

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

        const result = await di
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

        const result = await di.application().ensurePermissions(
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

        const result = await di.application().deletePermission(name, c.var.user.id)

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

        const result = await di
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

        const result = await di.application().deleteRole(name, c.var.user.id)

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

        const result = await di.application().assignRoleToUser(id, name, c.var.user.id)

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

        const result = await di.application().checkMyPermission(permission, c.var.user.id)

        return result.match(
          (hasPermission) => c.json({ success: true, hasPermission } as const),
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

    .get('/me/permissions', requireUser, async (c) => {
      const result = await di.application().getMyPermissions(c.var.user.id)

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
