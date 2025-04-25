import { type } from 'arktype'

import {
  createRoute,
  type RouteDefinition,
  type RouteResponse,
} from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { type GetAllMediaArtifactTypesQueryHandler } from '../../../application/media-artifact-types/get-all-media-artifact-types.js'

export function createGetAllMediaArtifactTypesRoute({
  getAllMediaArtifactTypes,
}: GetAllMediaArtifactTypesRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const response = await getAllMediaArtifactTypes()
      return c.json({ success: true, ...response }, 200)
    },
  )
}

export type GetAllMediaArtifactTypesRouteDependencies = {
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
}

const definition = {
  description: 'Get all media artifact types',
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
