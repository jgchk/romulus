import { type } from 'arktype'

import { createErrorResponseWithDetails } from '../../../../common/web/utils.js'
import type { UpdateMediaArtifactRelationshipTypeCommandHandler } from '../../../application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import { MediaArtifactRelationshipTypeNotFoundError } from '../../../domain/media-artifact-relationship-types/errors.js'
import { MediaArtifactTypeNotFoundError } from '../../../domain/media-artifact-types/errors.js'
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

export function createUpdateMediaArtifactRelationshipTypeRoute({
  authz,
  updateMediaArtifactRelationshipType,
}: UpdateMediaArtifactRelationshipTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
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
    async (c): Promise<RouteResponse<typeof definition>> => {
      const param = c.req.valid('param')
      const body = c.req.valid('json')
      const result = await updateMediaArtifactRelationshipType({
        id: param.id,
        update: body,
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
}

export type UpdateMediaArtifactRelationshipTypeRouteDependencies = {
  authz: AuthorizationMiddleware
  updateMediaArtifactRelationshipType: UpdateMediaArtifactRelationshipTypeCommandHandler
}

const definition = {
  description: 'Update a media artifact relationship type',
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
      description: 'Media artifact relationship type not found',
      content: {
        'application/json': {
          schema: createErrorResponseWithDetails(
            type('"MediaArtifactRelationshipTypeNotFoundError"'),
            type('404'),
            type({ id: 'string' }),
          ),
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
