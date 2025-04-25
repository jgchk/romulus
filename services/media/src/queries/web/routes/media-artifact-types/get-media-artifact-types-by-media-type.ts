import { type } from 'arktype'

import {
  createRoute,
  type RouteDefinition,
  type RouteResponse,
  validator,
} from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { type GetMediaArtifactTypesByMediaTypeQueryHandler } from '../../../application/media-artifact-types/get-media-artifact-types-by-media-type.js'

export function createGetMediaArtifactTypesByMediaTypeRoute({
  getMediaArtifactTypesByMediaType,
}: GetAllMediaArtifactTypesRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const { id } = c.req.valid('param')
      const response = await getMediaArtifactTypesByMediaType(id)
      return c.json({ success: true, ...response }, 200)
    },
  )
}

export type GetAllMediaArtifactTypesRouteDependencies = {
  getMediaArtifactTypesByMediaType: GetMediaArtifactTypesByMediaTypeQueryHandler
}

const definition = {
  description: 'Get all media artifact types for a given media type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
            mediaArtifactTypes: type(
              { id: 'string', name: 'string', mediaTypes: 'string[]' },
              '[]',
            ),
            mediaArtifactRelationshipTypes: type(
              {
                id: 'string',
                name: 'string',
                parentMediaArtifactType: 'string',
                childMediaArtifactTypes: 'string[]',
              },
              '[]',
            ),
          }),
        },
      },
    },
  },
} satisfies RouteDefinition
