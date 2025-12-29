import { OpenAPIHono } from '@hono/zod-openapi'

import type { AuthorizationApplication } from '../application/index.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import {
  DuplicatePermissionError,
  PermissionNotFoundError,
  RoleNotFoundError,
  UnauthorizedError,
} from '../domain/authorizer.js'
import { getBearerAuthToken, UnauthenticatedError } from './bearer-auth-middleware.js'
import {
  assignRoleToUserRoute,
  checkMyPermissionRoute,
  createPermissionRoute,
  createRoleRoute,
  deletePermissionRoute,
  deleteRoleRoute,
  ensurePermissionsRoute,
  getMyPermissionsRoute,
  getUsersWithRoleRoute,
  removeRoleFromUserRoute,
} from './routes.js'

export type Router = ReturnType<typeof createAuthorizationRouter>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}

export function createAuthorizationRouter(deps: AuthorizationRouterDependencies) {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: {
              name: 'ValidationError',
              message: 'Request validation failed',
              details: { target: result.target, issues: result.error.issues },
              statusCode: 400,
            },
          } as const,
          400,
        )
      }
    },
  })
    .openapi(createPermissionRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const permission = c.req.valid('json').permission

      const result = await deps
        .application()
        .createPermission(permission.name, permission.description, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'UnauthorizedError',
                  message: err.message,
                  statusCode: 403,
                },
              } as const,
              403,
            )
          } else if (err instanceof DuplicatePermissionError) {
            return c.json(
              {
                success: false,
                error: {
                  name: 'DuplicatePermissionError',
                  message: err.message,
                  statusCode: 409,
                },
              } as const,
              409,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(ensurePermissionsRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const permissions = c.req.valid('json').permissions

      const result = await deps.application().ensurePermissions(
        permissions.map((p) => ({ name: p.name, description: p.description })),
        user.id,
      )

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(deletePermissionRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const name = c.req.valid('param').name

      const result = await deps.application().deletePermission(name, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(createRoleRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const role = c.req.valid('json').role

      const result = await deps
        .application()
        .createRole(role.name, new Set(role.permissions), role.description, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else if (err instanceof PermissionNotFoundError) {
            return c.json(
              {
                success: false,
                error: { name: 'PermissionNotFoundError', message: err.message, statusCode: 400 },
              } as const,
              400,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(deleteRoleRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const name = c.req.valid('param').name

      const result = await deps.application().deleteRole(name, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(assignRoleToUserRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const id = c.req.valid('param').id
      const name = c.req.valid('json').name

      const result = await deps.application().assignRoleToUser(id, name, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else if (err instanceof RoleNotFoundError) {
            return c.json(
              {
                success: false,
                error: { name: 'RoleNotFoundError', message: err.message, statusCode: 400 },
              } as const,
              400,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(checkMyPermissionRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const { permission } = c.req.valid('param')

      const result = await deps.application().checkMyPermission(permission, user.id)

      return c.json({ success: true, hasPermission: result } as const, 200)
    })
    .openapi(getMyPermissionsRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const result = await deps.application().getMyPermissions(user.id)

      return result.match(
        (permissions) => c.json({ success: true as const, permissions: [...permissions] }, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(getUsersWithRoleRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const { name } = c.req.valid('param')
      const result = await deps.application().getUsersWithRole(name, user.id)

      return result.match(
        (userIds) => c.json({ success: true as const, userIds }, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else {
            assertUnreachable(err)
          }
        },
      )
    })
    .openapi(removeRoleFromUserRoute, async (c) => {
      const token = getBearerAuthToken(c)
      if (token === undefined) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: new UnauthenticatedError().message,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }

      const whoamiResponse = await deps.authentication().whoami(token)
      if (whoamiResponse.isErr()) {
        return c.json(
          {
            success: false,
            error: {
              name: 'UnauthenticatedError',
              message: 'Failed to authenticate',
              details: whoamiResponse.error,
              statusCode: 401,
            },
          } as const,
          401,
        )
      }
      const user = whoamiResponse.value

      const { id, roleName } = c.req.valid('param')
      const result = await deps.application().removeRoleFromUser(id, roleName, user.id)

      return result.match(
        () => c.json({ success: true } as const, 200),
        (err) => {
          if (err instanceof UnauthorizedError) {
            return c.json(
              {
                success: false,
                error: { name: 'UnauthorizedError', message: err.message, statusCode: 403 },
              } as const,
              403,
            )
          } else if (err instanceof RoleNotFoundError) {
            return c.json(
              {
                success: false,
                error: { name: 'RoleNotFoundError', message: err.message, statusCode: 400 },
              } as const,
              400,
            )
          } else {
            assertUnreachable(err)
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
