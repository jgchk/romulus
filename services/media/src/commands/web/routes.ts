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
        },
      }),
    successResponse: type({
      success: 'true',
    }),
    errorResponse: createErrorResponse(type('"MediaTypeTreeCycleError"'), type('400')),
  },
}
