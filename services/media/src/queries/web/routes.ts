import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse } from '../../common/web/utils.js'

export const routes = {
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

  getMediaArtifactType: {
    route: () =>
      describeRoute({
        description: 'Get a media artifact type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaArtifactType.successResponse),
              },
            },
          },
          404: {
            description: 'Media artifact type not found',
            content: {
              'application/json': {
                schema: resolver(routes.getMediaArtifactType.errorResponse),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
      mediaArtifactType: type({ id: 'string', name: 'string', mediaTypes: 'string[]' }),
    }),
    errorResponse: createErrorResponse(type('"MediaArtifactTypeNotFoundError"'), type('404')),
  },

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
