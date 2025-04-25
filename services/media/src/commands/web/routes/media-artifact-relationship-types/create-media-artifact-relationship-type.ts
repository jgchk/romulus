import { type } from 'arktype'

import { createErrorResponseWithDetails } from '../../../../common/web/utils.js'
import { type RouteDefinition } from '../../../../common/web/utils.js'
import { createRoute } from '../../../../common/web/utils.js'
import { type RouteResponse } from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { validator } from '../../../../common/web/utils.js'
import { assertUnreachable } from '../../../../utils.js'
import { type CreateMediaArtifactRelationshipTypeCommandHandler } from '../../../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import { MediaArtifactTypeNotFoundError } from '../../../domain/media-artifact-types/errors.js'
import { MediaPermission } from '../../../domain/permissions.js'
import { type AuthorizationMiddleware } from '../../authorization-middleware.js'
import {
  badRequestErrorResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../../errors.js'

export function createCreateMediaArtifactRelationshipTypeRoute({
  authz,
  createMediaArtifactRelationshipType,
}: CreateMediaArtifactRelationshipTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
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
    async (c): Promise<RouteResponse<typeof definition>> => {
      const body = c.req.valid('json')
      const result = await createMediaArtifactRelationshipType({
        mediaArtifactRelationshipType: body,
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
}

export type CreateMediaArtifactRelationshipTypeRouteDependencies = {
  authz: AuthorizationMiddleware
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
}

const definition = {
  description: 'Create a media artifact relationship type',
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
          schema: createErrorResponseWithDetails(
            type('"MediaArtifactTypeNotFoundError"'),
            type('422'),
            type({ id: 'string' }),
          ),
        },
      },
    },
  },
} satisfies RouteDefinition
