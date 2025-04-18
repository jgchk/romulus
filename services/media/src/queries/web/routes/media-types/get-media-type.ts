import { type } from 'arktype'

import { MediaTypeNotFoundError } from '../../../../commands/domain/media-types/errors.js'
import {
  createErrorResponse,
  createRoute,
  type RouteDefinition,
  type RouteResponse,
  validator,
} from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import type { GetMediaTypeQueryHandler } from '../../../application/media-types/get-media-type.js'

export function createGetMediaTypeRoute({ getMediaType }: GetMediaTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const { id } = c.req.valid('param')
      const mediaType = await getMediaType(id)
      if (mediaType === undefined) {
        const error = new MediaTypeNotFoundError(id)
        return c.json(
          {
            success: false,
            error: { name: error.name, message: error.message, statusCode: 404 as const },
          },
          404,
        )
      }
      return c.json({ success: true, mediaType }, 200)
    },
  )
}

export type GetMediaTypeRouteDependencies = {
  getMediaType: GetMediaTypeQueryHandler
}

const definition = {
  description: 'Get a media type by id',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
            mediaType: type({
              id: 'string',
              name: 'string',
              parents: 'string[]',
            }),
          }),
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
  },
} satisfies RouteDefinition
