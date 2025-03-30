import { type } from 'arktype'
import { Hono } from 'hono'
import { validator } from 'hono-openapi/arktype'

import type { CreateMediaTypeCommandHandler } from '../application/create-media-type.js'
import type { UpdateMediaTypeCommandHandler } from '../application/update-media-type.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import type { IAuthorizationService } from '../domain/authorization.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../domain/errors.js'
import { MediaPermission } from '../domain/permissions.js'
import { createAuthorizationMiddleware } from './authorization-middleware.js'
import { bearerAuth } from './bearer-auth-middleware.js'
import { routes } from './routes.js'

export type MediaRouter = ReturnType<typeof createMediaRouter>

export type MediaRouterDependencies = {
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaRouter({
  createMediaType,
  updateMediaType,
  authentication,
  authorization,
}: MediaRouterDependencies) {
  const authz = createAuthorizationMiddleware(authorization)

  const app = new Hono()
    .use(bearerAuth(authentication))
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
      authz(MediaPermission.CreateMediaTypes),
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
                } satisfies typeof routes.createMediaType.errorResponse.infer,
                400,
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
      authz(MediaPermission.EditMediaTypes),
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

  return app
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here")
}
