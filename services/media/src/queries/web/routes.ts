import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse } from '../../common/web/utils.js'

export const routes = {
  getMediaArtifactRelationshipType: {
    route: () =>
      describeRoute({
        description: 'Get a media artifact relationship type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaArtifactRelationshipType.successResponse),
              },
            },
          },
          404: {
            description: 'Media artifact type not found',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaArtifactRelationshipType.errorResponse),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
      mediaArtifactRelationshipType: type({
        id: 'string',
        name: 'string',
        parentMediaArtifactType: 'string',
        childMediaArtifactTypes: 'string[]',
      }),
    }),
    errorResponse: createErrorResponse(
      type('"MediaArtifactRelationshipTypeNotFoundError"'),
      type('404'),
    ),
  },
}
