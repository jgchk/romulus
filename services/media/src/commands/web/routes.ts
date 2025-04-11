import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse } from '../../common/web/utils.js'

export const routes = {
  createMediaType: {
    route: () =>
      describeRoute({
        description: 'Create a media type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.createMediaType.successResponse),
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: resolver(routes.createMediaType.errorResponse.mediaTypeTreeCycleError),
              },
            },
          },
          401: {
            description: 'Unauthenticated',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          404: {
            description: 'Media type not found',
            content: {
              'application/json': {
                schema: resolver(routes.createMediaType.errorResponse.mediaTypeNotFoundError),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
    }),
    errorResponse: {
      mediaTypeTreeCycleError: createErrorResponse(type('"MediaTypeTreeCycleError"'), type('400')),
      mediaTypeNotFoundError: createErrorResponse(type('"MediaTypeNotFoundError"'), type('404')),
    },
  },

  updateMediaType: {
    route: () =>
      describeRoute({
        description: 'Update a media type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.updateMediaType.successResponse),
              },
            },
          },
          400: {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: resolver(routes.updateMediaType.errorResponse.cycle),
              },
            },
          },
          401: {
            description: 'Unauthenticated',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          404: {
            description: 'Not found',
            content: {
              'application/json': {
                schema: resolver(routes.updateMediaType.errorResponse.notFound),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
    }),
    errorResponse: {
      cycle: createErrorResponse(type('"MediaTypeTreeCycleError"'), type('400')),
      notFound: createErrorResponse(type('"MediaTypeNotFoundError"'), type('404')),
    },
  },

  createMediaArtifactType: {
    route: () =>
      describeRoute({
        description: 'Create a media artifact type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.createMediaArtifactType.successResponse),
              },
            },
          },
          401: {
            description: 'Unauthenticated',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          422: {
            description: 'Referenced media type does not exist',
            content: {
              'application/json': {
                schema: resolver(
                  routes.createMediaArtifactType.errorResponse.mediaTypeNotFoundError,
                ),
              },
            },
          },
        },
      }),
    successResponse: type({
      success: 'true',
    }),
    errorResponse: {
      mediaTypeNotFoundError: createErrorResponse(type('"MediaTypeNotFoundError"'), type('422')),
    },
  },

  createMediaArtifactRelationshipType: {
    route: () =>
      describeRoute({
        description: 'Create a media artifact relationship type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.createMediaArtifactRelationshipType.successResponse),
              },
            },
          },
          401: {
            description: 'Unauthenticated',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          403: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: resolver(routes.unauthorizedErrorResponse),
              },
            },
          },
          422: {
            description: 'Referenced media type does not exist',
            content: {
              'application/json': {
                schema: resolver(
                  routes.createMediaArtifactRelationshipType.errorResponse
                    .mediaArtifactTypeNotFoundError,
                ),
              },
            },
          },
        },
      }),
    successResponse: type({ success: 'true' }),
    errorResponse: {
      mediaArtifactTypeNotFoundError: createErrorResponse(
        type('"MediaArtifactTypeNotFoundError"'),
        type('422'),
      ),
    },
  },

  badRequestErrorResponse: createErrorResponse(type('"BadRequestError"'), type('400')),
  unauthenticatedErrorResponse: createErrorResponse(type('"UnauthenticatedError"'), type('401')),
  unauthorizedErrorResponse: createErrorResponse(type('"UnauthorizedError"'), type('403')),
}
