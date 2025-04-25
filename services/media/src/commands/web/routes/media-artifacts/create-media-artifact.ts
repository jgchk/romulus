import { type } from 'arktype'

import { createErrorResponse } from '../../../../common/web/utils.js'
import { type RouteDefinition } from '../../../../common/web/utils.js'
import { type RouteResponse } from '../../../../common/web/utils.js'
import { createRoute } from '../../../../common/web/utils.js'
import { validator } from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { assertUnreachable } from '../../../../utils.js'
import type { CreateMediaArtifactCommandHandler } from '../../../application/media-artifacts/create-media-artifact.js'
import { MediaArtifactTypeNotFoundError } from '../../../domain/media-artifact-types/errors.js'
import { MediaPermission } from '../../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../../authorization-middleware.js'
import {
  badRequestErrorResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../../errors.js'

export function createCreateMediaArtifactRoute({
  authz,
  createMediaArtifact,
}: CreateMediaArtifactRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('json', type({ id: 'string', name: 'string', mediaArtifactType: 'string' })),
    authz(MediaPermission.WriteMediaArtifacts),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const body = c.req.valid('json')
      const result = await createMediaArtifact({
        mediaArtifact: body,
        userId: c.var.user.id,
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

export type CreateMediaArtifactRouteDependencies = {
  authz: AuthorizationMiddleware
  createMediaArtifact: CreateMediaArtifactCommandHandler
}

const definition = {
  description: 'Create a media artifact',
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
      description: 'Referenced media artifact type does not exist',
      content: {
        'application/json': {
          schema: createErrorResponse(type('"MediaArtifactTypeNotFoundError"'), type('422')),
        },
      },
    },
  },
} satisfies RouteDefinition
