import type { Type } from 'arktype'
import { type } from 'arktype'
import { type Env, Hono, type MiddlewareHandler, type ValidationTargets } from 'hono'
import type { HasUndefined } from 'hono-openapi'
import { validator as arktypeValidator } from 'hono-openapi/arktype'

import type { CreateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import type { CreateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/create-media-artifact-type.js'
import type { UpdateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/update-media-artifact-type.js'
import type { CreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import type { UpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import type { IAuthorizationService } from '../domain/authorization.js'
import { MediaArtifactTypeNotFoundError } from '../domain/media-artifact-types/errors.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../domain/media-types/errors.js'
import { MediaPermission } from '../domain/permissions.js'
import { createAuthorizationMiddleware } from './authorization-middleware.js'
import { createBearerAuthMiddleware } from './bearer-auth-middleware.js'
import { routes } from './routes.js'

export type MediaCommandsRouter = ReturnType<typeof createMediaCommandsRouter>

export type MediaCommandsRouterDependencies = {
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaCommandsRouter({
  createMediaType,
  updateMediaType,
  createMediaArtifactType,
  updateMediaArtifactType,
  createMediaArtifactRelationshipType,
  authentication,
  authorization,
}: MediaCommandsRouterDependencies) {
  const bearerAuth = createBearerAuthMiddleware(authentication)
  const authz = createAuthorizationMiddleware(authorization)

  const app = new Hono()
    .use(bearerAuth)
    .post(
      '/media-types',
      routes.createMediaType.route(),
      validator(
        'json',
        type({
          id: 'string',
          name: 'string',
          parents: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaTypes),
      async (c) => {
        const body = c.req.valid('json')
        const result = await createMediaType({ mediaType: body })
        return result.match(
          () =>
            c.json(
              { success: true } satisfies typeof routes.createMediaType.successResponse.infer,
              200,
            ),
          (err) => {
            if (err instanceof MediaTypeTreeCycleError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 400,
                  },
                } satisfies typeof routes.createMediaType.errorResponse.mediaTypeTreeCycleError.infer,
                400,
              )
            } else if (err instanceof MediaTypeNotFoundError) {
              return c.json(
                {
                  success: false,
                  error: { name: err.name, message: err.message, statusCode: 404 },
                } satisfies typeof routes.createMediaType.errorResponse.mediaTypeNotFoundError.infer,
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
      routes.updateMediaType.route(),
      validator('param', type({ id: 'string' })),
      validator(
        'json',
        type({
          name: 'string',
          parents: 'string[]',
        }),
      ),
      authz(MediaPermission.WriteMediaTypes),
      async (c) => {
        const param = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await updateMediaType({ id: param.id, update: body })
        return result.match(
          () =>
            c.json(
              { success: true } satisfies typeof routes.updateMediaType.successResponse.infer,
              200,
            ),
          (err) => {
            if (err instanceof MediaTypeTreeCycleError) {
              return c.json(
                {
                  success: false,
                  error: {
                    name: err.name,
                    message: err.message,
                    statusCode: 400,
                  },
                } satisfies typeof routes.updateMediaType.errorResponse.cycle.infer,
                400,
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
                } satisfies typeof routes.updateMediaType.errorResponse.notFound.infer,
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
      routes.createMediaArtifactType.route(),
      validator('json', type({ id: 'string', name: 'string', mediaTypes: 'string[]' })),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c) => {
        const body = c.req.valid('json')
        const result = await createMediaArtifactType({ mediaArtifactType: body })
        return result.match(
          () =>
            c.json(
              {
                success: true,
              } satisfies typeof routes.createMediaArtifactType.successResponse.infer,
              200,
            ),
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
                } satisfies typeof routes.createMediaArtifactType.errorResponse.mediaTypeNotFoundError.infer,
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
      routes.updateMediaArtifactType.route(),
      validator('param', type({ id: 'string' })),
      validator('json', type({ name: 'string', mediaTypes: 'string[]' })),
      authz(MediaPermission.WriteMediaArtifactTypes),
      async (c) => {
        const param = c.req.valid('param')
        const body = c.req.valid('json')
        const result = await updateMediaArtifactType({ id: param.id, update: body })
        return result.match(
          () =>
            c.json(
              {
                success: true,
              } satisfies typeof routes.updateMediaArtifactType.successResponse.infer,
              200,
            ),
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
                } satisfies typeof routes.updateMediaArtifactType.errorResponse.mediaTypeNotFoundError.infer,
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
                } satisfies typeof routes.updateMediaArtifactType.errorResponse.mediaArtifactTypeNotFoundError.infer,
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
      '/media-artifact-relationship-types',
      routes.createMediaArtifactRelationshipType.route(),
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
      async (c) => {
        const body = c.req.valid('json')
        const result = await createMediaArtifactRelationshipType({
          mediaArtifactRelationshipType: body,
        })
        return result.match(
          () =>
            c.json(
              {
                success: true,
              } satisfies typeof routes.createMediaArtifactType.successResponse.infer,
              200,
            ),
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
                } satisfies typeof routes.createMediaArtifactRelationshipType.errorResponse.mediaArtifactTypeNotFoundError.infer,
                422,
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
  return arktypeValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: { name: 'BadRequestError', message: result.errors.summary, statusCode: 400 },
        } satisfies typeof routes.badRequestErrorResponse.infer,
        400,
      )
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
