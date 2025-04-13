import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse, createErrorResponseWithDetails } from '../../common/web/utils.js'

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

  updateMediaArtifactType: {
    route: () =>
      describeRoute({
        description: 'Update a media artifact type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.updateMediaArtifactType.successResponse),
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
            description: 'Media artifact type not found',
            content: {
              'application/json': {
                schema: resolver(
                  routes.updateMediaArtifactType.errorResponse.mediaArtifactTypeNotFoundError,
                ),
              },
            },
          },
          422: {
            description: 'Referenced media type does not exist',
            content: {
              'application/json': {
                schema: resolver(
                  routes.updateMediaArtifactType.errorResponse.mediaTypeNotFoundError,
                ),
              },
            },
          },
        },
      }),
    successResponse: type({ success: 'true' }),
    errorResponse: {
      mediaTypeNotFoundError: createErrorResponse(type('"MediaTypeNotFoundError"'), type('422')),
      mediaArtifactTypeNotFoundError: createErrorResponse(
        type('"MediaArtifactTypeNotFoundError"'),
        type('404'),
      ),
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
            description: 'Referenced media artifact type does not exist',
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
      mediaArtifactTypeNotFoundError: createErrorResponseWithDetails(
        type('"MediaArtifactTypeNotFoundError"'),
        type('422'),
        type({ id: 'string' }),
      ),
    },
  },

  updateMediaArtifactRelationshipType: {
    route: () =>
      describeRoute({
        description: 'Update a media artifact relationship type',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: resolver(routes.updateMediaArtifactRelationshipType.successResponse),
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
            description: 'Media artifact relationship type not found',
            content: {
              'application/json': {
                schema: resolver(
                  routes.updateMediaArtifactRelationshipType.errorResponse
                    .mediaArtifactRelationshipTypeNotFoundError,
                ),
              },
            },
          },
          422: {
            description: 'Referenced media artifact type does not exist',
            content: {
              'application/json': {
                schema: resolver(
                  routes.updateMediaArtifactRelationshipType.errorResponse
                    .mediaArtifactTypeNotFoundError,
                ),
              },
            },
          },
        },
      }),
    successResponse: type({ success: 'true' }),
    errorResponse: {
      mediaArtifactRelationshipTypeNotFoundError: createErrorResponseWithDetails(
        type('"MediaArtifactRelationshipTypeNotFoundError"'),
        type('404'),
        type({ id: 'string' }),
      ),
      mediaArtifactTypeNotFoundError: createErrorResponseWithDetails(
        type('"MediaArtifactTypeNotFoundError"'),
        type('422'),
        type({ id: 'string' }),
      ),
    },
  },

  badRequestErrorResponse: createErrorResponse(type('"BadRequestError"'), type('400')),
  unauthenticatedErrorResponse: createErrorResponse(type('"UnauthenticatedError"'), type('401')),
  unauthorizedErrorResponse: createErrorResponse(type('"UnauthorizedError"'), type('403')),
}
