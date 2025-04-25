import { type } from 'arktype'

import { createErrorResponse } from '../../../../common/web/utils.js'
import { createRoute } from '../../../../common/web/utils.js'
import { type RouteDefinition } from '../../../../common/web/utils.js'
import { type RouteResponse } from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { validator } from '../../../../common/web/utils.js'
import { assertUnreachable } from '../../../../utils.js'
import { type CreateMediaTypeCommandHandler } from '../../../application/media-types/create-media-type.js'
import {
  MediaTypeNotFoundError,
  MediaTypeTreeCycleError,
} from '../../../domain/media-types/errors.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { type AuthorizationMiddleware } from '../../authorization-middleware.js'
import {
  badRequestErrorResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../../errors.js'

export function createCreateMediaTypeRoute({
  authz,
  createMediaType,
}: CreateMediaTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator(
      'json',
      type({
        id: 'string',
        name: 'string',
        parents: 'string[]',
      }),
    ),
    authz(MediaPermission.WriteMediaTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const body = c.req.valid('json')
      const result = await createMediaType({ mediaType: body, userId: c.var.user.id })
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
}

export type CreateMediaTypeRouteDependencies = {
  authz: AuthorizationMiddleware
  createMediaType: CreateMediaTypeCommandHandler
}

const definition = {
  description: 'Create a media type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
          }),
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: badRequestErrorResponse,
        },
      },
    },
    401: {
      description: 'Unauthenticated',
      content: {
        'application/json': {
          schema: unauthenticatedErrorResponse,
        },
      },
    },
    403: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: unauthorizedErrorResponse,
        },
      },
    },
    404: {
      description: 'Media type not found',
      content: {
        'application/json': {
          schema: createErrorResponse(type('"MediaTypeNotFoundError"'), type('404')),
        },
      },
    },
    422: {
      description: 'Unprocessable content',
      content: {
        'application/json': {
          schema: createErrorResponse(type('"MediaTypeTreeCycleError"'), type('422')),
        },
      },
    },
  },
} satisfies RouteDefinition
