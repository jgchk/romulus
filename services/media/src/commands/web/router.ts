import type { Type } from 'arktype'
import { type } from 'arktype'
import {
  type Env,
  Hono,
  type MiddlewareHandler,
  type TypedResponse,
  type ValidationTargets,
} from 'hono'
import { type HasUndefined } from 'hono-openapi'
import { validator as arktypeValidator } from 'hono-openapi/arktype'

import type { CreateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import type { UpdateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import type { CreateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/create-media-artifact-type.js'
import type { DeleteMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/delete-media-artifact-type.js'
import type { UpdateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/update-media-artifact-type.js'
import type { CreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import type { UpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import type { IAuthorizationService } from '../domain/authorization.js'
import { MediaArtifactRelationshipTypeNotFoundError } from '../domain/media-artifact-relationship-types/errors.js'
import { MediaArtifactTypeNotFoundError } from '../domain/media-artifact-types/errors.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../domain/media-types/errors.js'
import { MediaPermission } from '../domain/permissions.js'
import { createAuthorizationMiddleware } from './authorization-middleware.js'
import { createBearerAuthMiddleware } from './bearer-auth-middleware.js'
import type { badRequestErrorResponse } from './routes.js'
import { createRoute, type RouteResponse, routes } from './routes.js'

export type MediaCommandsRouter = ReturnType<typeof createMediaCommandsRouter>

export type MediaCommandsRouterDependencies = {
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  deleteMediaArtifactType: DeleteMediaArtifactTypeCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  updateMediaArtifactRelationshipType: UpdateMediaArtifactRelationshipTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaCommandsRouter({
  createMediaType,
  updateMediaType,
  createMediaArtifactType,
  updateMediaArtifactType,
  deleteMediaArtifactType,
  createMediaArtifactRelationshipType,
  updateMediaArtifactRelationshipType,
  authentication,
  authorization,
}: MediaCommandsRouterDependencies) {
  const bearerAuth = createBearerAuthMiddleware(authentication)
  const authz = createAuthorizationMiddleware(authorization)

  const app = new Hono()
    .use(bearerAuth)
    .post(
      '/media-types',
      createRoute(routes.createMediaType),
      validator(
        'json',
        type({
          id: 'string',
          name: 'string',
          parents: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaTypes),
      async (c): Promise<RouteResponse<typeof routes.createMediaType>> => {
        const body = c.req.valid('json')
        const result = await createMediaType({ mediaType: body })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaTypeTreeCycleError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                  },
                } as const,
                422,
              )
            } else if (err instanceof MediaTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: { name: err.name, message: err.message, statusCode: 404 },
                } as const,
                404,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )
    .put(
      '/media-types/:id',
      createRoute(routes.updateMediaType),
      validator('param', type({ id: 'string' })),
      validator(
        'json',
        type({
          name: 'string',
          parents: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaTypes),
      async (c): Promise<RouteResponse<typeof routes.updateMediaType>> => {
        const param = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await updateMediaType({ id: param.id, update: body })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaTypeTreeCycleError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                  },
                },
                422,
              )
            } else if (err instanceof MediaTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 404,
                  },
                },
                404,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )
    .post(
      '/media-artifact-types',
      createRoute(routes.createMediaArtifactType),
      validator('json', type({ id: 'string', name: 'string', mediaTypes: 'string[]' })),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c): Promise<RouteResponse<typeof routes.createMediaArtifactType>> => {
        const body = c.req.valid('json')
        const result = await createMediaArtifactType({ mediaArtifactType: body })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                  },
                },
                422,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )
    .put(
      '/media-artifact-types/:id',
      createRoute(routes.updateMediaArtifactType),
      validator('param', type({ id: 'string' })),
      validator('json', type({ name: 'string', mediaTypes: 'string[]' })),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c): Promise<RouteResponse<typeof routes.updateMediaArtifactType>> => {
        const param = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await updateMediaArtifactType({ id: param.id, update: body })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                  },
                },
                422,
              )
            } else if (err instanceof MediaArtifactTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 404,
                  },
                },
                404,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )
    .delete(
      '/media-artifact-types/:id',
      createRoute(routes.deleteMediaArtifactType),
      validator('param', type({ id: 'string' })),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c): Promise<RouteResponse<typeof routes.deleteMediaArtifactType>> => {
        const param = c.req.valid('param')
        await deleteMediaArtifactType({ id: param.id })
        return c.json({ success: true }, 200)
      },
    )
    .post(
      '/media-artifact-relationship-types',
      createRoute(routes.createMediaArtifactRelationshipType),
      validator(
        'json',
        type({
          id: 'string',
          name: 'string',
          parentMediaArtifactType: 'string',
          childMediaArtifactTypes: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c): Promise<RouteResponse<typeof routes.createMediaArtifactRelationshipType>> => {
        const body = c.req.valid('json')
        const result = await createMediaArtifactRelationshipType({
          mediaArtifactRelationshipType: body,
        })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaArtifactTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                    details: { id: err.id },
                  },
                },
                422,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )
    .put(
      '/media-artifact-relationship-types/:id',
      createRoute(routes.updateMediaArtifactRelationshipType),
      validator('param', type({ id: 'string' })),
      validator(
        'json',
        type({
          name: 'string',
          parentMediaArtifactType: 'string',
          childMediaArtifactTypes: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c): Promise<RouteResponse<typeof routes.updateMediaArtifactRelationshipType>> => {
        const param = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await updateMediaArtifactRelationshipType({
          id: param.id,
          update: body,
        })
        return result.match(
          () => c.json({ success: true }, 200),
          (err) => {
            if (err instanceof MediaArtifactTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 422,
                    details: { id: err.id },
                  },
                },
                422,
              )
            } else if (err instanceof MediaArtifactRelationshipTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 404,
                    details: { id: err.id },
                  },
                },
                404,
              )
            } else {
              assertUnreachable(err)
            }
          },
        )
      },
    )

  return app
}

function validator<
  T extends Type,
  Target extends keyof ValidationTargets,
  E extends Env,
  P extends string,
  I = T['inferIn'],
  O = T['infer'],
  V extends {
    in: HasUndefined<I> extends true ? Partial<Record<Target, I>> : Record<Target, I>
    out: Record<Target, O>
  } = {
    in: HasUndefined<I> extends true ? Partial<Record<Target, I>> : Record<Target, I>
    out: Record<Target, O>
  },
>(target: Target, schema: T): MiddlewareHandler<E, P, V> {
  return arktypeValidator(
    target,
    schema,
    (
      result,
      c,
    ):
      | TypedResponse<
          typeof badRequestErrorResponse.infer,
          (typeof badRequestErrorResponse.infer)['error']['statusCode']
        >
      | undefined => {
      if (!result.success) {
        return c.json(
          {
            success: false,
            error: { name: 'BadRequestError', message: result.errors.summary, statusCode: 400 },
          },
          400,
        )
      }
    },
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
