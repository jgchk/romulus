import { type } from 'arktype'

import { createErrorResponse } from '../../../../common/web/utils.js'
import type { CreateMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/create-media-artifact-type.js'
import { MediaTypeNotFoundError } from '../../../domain/media-types/errors.js'
import { MediaPermission } from '../../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../../authorization-middleware.js'
import {
  badRequestErrorResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../../errors.js'
import { type RouteDefinition } from '../common.js'
import { type RouteResponse } from '../common.js'
import { createRoute } from '../common.js'
import { assertUnreachable, factory, validator } from '../common.js'

const definition = {
  description: 'Create a media artifact type',
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
    422: {
      description: 'Referenced media type does not exist',
      content: {
        'application/json': {
          schema: createErrorResponse(type('"MediaTypeNotFoundError"'), type('422')),
        },
      },
    },
  },
} satisfies RouteDefinition

export function createCreateMediaArtifactTypeRoute({
  authz,
  createMediaArtifactType,
}: {
  authz: AuthorizationMiddleware
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
}) {
  return factory.createHandlers(
    createRoute(definition),
    validator('json', type({ id: 'string', name: 'string', mediaTypes: 'string[]' })),
    authz(MediaPermission.WriteMediaArtifactTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
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
}
