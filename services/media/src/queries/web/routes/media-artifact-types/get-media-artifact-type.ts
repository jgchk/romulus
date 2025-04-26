import { type } from 'arktype'

import { MediaArtifactTypeNotFoundError } from '../../../../commands/domain/media-artifact-types/errors.js'
import type { RouteDefinition, RouteResponse } from '../../../../common/web/utils.js'
import { createErrorResponse, createRoute, validator } from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import type { GetMediaArtifactTypeQueryHandler } from '../../../application/media-artifact-types/get-media-artifact-type.js'

export function createGetMediaArtifactTypeRoute({
  getMediaArtifactType,
}: GetMediaArtifactTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const { id } = c.req.valid('param')
      const mediaArtifactType = await getMediaArtifactType(id)
      if (mediaArtifactType === undefined) {
        const error = new MediaArtifactTypeNotFoundError(id)
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
          mediaArtifactType,
        },
        200,
      )
    },
  )
}

export type GetMediaArtifactTypeRouteDependencies = {
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
}

const definition = {
  description: 'Get a media artifact type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({
            success: 'true',
            mediaArtifactType: type({ id: 'string', name: 'string', mediaTypes: 'string[]' }),
          }),
        },
      },
    },
    404: {
      description: 'Media artifact type not found',
      content: {
        'application/json': {
          schema: createErrorResponse(type('"MediaArtifactTypeNotFoundError"'), type('404')),
        },
      },
    },
  },
} satisfies RouteDefinition
