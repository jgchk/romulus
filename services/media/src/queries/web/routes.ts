import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse } from '../../common/web/utils.js'

export const routes = {
  getAllMediaTypes: {
    route: () =>
      describeRoute({
        description: 'Get all media types',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.getAllMediaTypes.successResponse),
              },
            },
          },
        },
      }),
    successResponse: type({
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
  getMediaType: {
    route: () =>
      describeRoute({
        description: 'Get a media type by id',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaType.successResponse),
              },
            },
          },
          404: {
            description: 'Media type not found',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaType.errorResponse),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
      mediaType: type({
        id: 'string',
        name: 'string',
        parents: 'string[]',
      }),
    }),
    errorResponse: createErrorResponse(type('"MediaTypeNotFoundError"'), type('404')),
  },
  getAllMediaArtifactTypes: {
    route: () =>
      describeRoute({
        description: 'Get all media artifact types',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.getAllMediaArtifactTypes.successResponse),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
      mediaArtifactTypes: type({ id: 'string', name: 'string', mediaTypes: 'string[]' }, '[]'),
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
}
