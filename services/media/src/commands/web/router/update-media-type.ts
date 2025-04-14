import { type } from 'arktype'

import { createErrorResponse } from '../../../common/web/utils.js'
import type { UpdateMediaTypeCommandHandler } from '../../application/media-types/update-media-type.js'
import { MediaTypeNotFoundError, MediaTypeTreeCycleError } from '../../domain/media-types/errors.js'
import { MediaPermission } from '../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../authorization-middleware.js'
import {
  badRequestErrorResponse,
  createRoute,
  type RouteDefinition,
  type RouteResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../routes.js'
import { assertUnreachable, factory, validator } from './common.js'

const definition = {
  description: 'Update a media type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({ success: 'true' }),
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
      description: 'Not found',
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

export function createUpdateMediaTypeRoute({
  authz,
  updateMediaType,
}: {
  authz: AuthorizationMiddleware
  updateMediaType: UpdateMediaTypeCommandHandler
}) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    validator(
      'json',
      type({
        name: 'string',
        parents: 'string[]',
      }),
    ),
    authz(MediaPermission.WriteMediaTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
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
}
