import { type } from 'arktype'

import {
  createRoute,
  type RouteDefinition,
  type RouteResponse,
} from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import { type GetAllMediaTypesQueryHandler } from '../../../application/media-types/get-all-media-types.js'

export function createGetAllMediaTypesRoute({
  getAllMediaTypes,
}: GetAllMediaTypesRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const mediaTypes = await getAllMediaTypes()
      return c.json({ success: true, mediaTypes }, 200)
    },
  )
}

export type GetAllMediaTypesRouteDependencies = {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
}

const definition = {
  description: 'Get all media types',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
            mediaTypes: type(
              {
                id: 'string',
                name: 'string',
                parents: 'string[]',
              },
              '[]',
            ),
          }),
        },
      },
    },
  },
} satisfies RouteDefinition
