import { type } from 'arktype'

import { MediaArtifactRelationshipTypeNotFoundError } from '../../../../commands/domain/media-artifact-relationship-types/errors.js'
import {
  createErrorResponse,
  createRoute,
  type RouteDefinition,
  type RouteResponse,
  validator,
} from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { type GetMediaArtifactRelationshipTypeQueryHandler } from '../../../application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'

export function createGetMediaArtifactRelationshipTypeRoute({
  getMediaArtifactRelationshipType,
}: GetMediaArtifactRelationshipTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const { id } = c.req.valid('param')
      const mediaArtifactRelationshipType = await getMediaArtifactRelationshipType(id)
      if (mediaArtifactRelationshipType === undefined) {
        const error = new MediaArtifactRelationshipTypeNotFoundError(id)
        return c.json(
          {
            success: false,
            error: { name: error.name, message: error.message, statusCode: 404 as const },
          },
          404,
        )
      }
      return c.json(
        {
          success: true,
          mediaArtifactRelationshipType,
        },
        200,
      )
    },
  )
}

export type GetMediaArtifactRelationshipTypeRouteDependencies = {
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
}

const definition = {
  description: 'Get a media artifact relationship type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
            mediaArtifactRelationshipType: type({
              id: 'string',
              name: 'string',
              parentMediaArtifactType: 'string',
              childMediaArtifactTypes: 'string[]',
            }),
          }),
        },
      },
    },
    404: {
      description: 'Media artifact relationship type not found',
      content: {
        'application/json': {
          schema: createErrorResponse(
            type('"MediaArtifactRelationshipTypeNotFoundError"'),
            type('404'),
          ),
        },
      },
    },
  },
} satisfies RouteDefinition
