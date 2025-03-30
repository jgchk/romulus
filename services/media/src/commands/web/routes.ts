import { type } from 'arktype'
import { describeRoute } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'

import { createErrorResponse } from './utils.js'

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
                schema: resolver(routes.createMediaType.errorResponse),
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
        },
      }),
    successResponse: type({
      success: 'true',
    }),
    errorResponse: createErrorResponse(type('"MediaTypeTreeCycleError"'), type('400')),
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

  unauthenticatedErrorResponse: createErrorResponse(type('"UnauthenticatedError"'), type('401')),
  unauthorizedErrorResponse: createErrorResponse(type('"UnauthorizedError"'), type('403')),
}
