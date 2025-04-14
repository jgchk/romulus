import { type } from 'arktype'
import type { TypedResponse } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { describeRoute, type DescribeRouteOptions } from 'hono-openapi'
import { resolver } from 'hono-openapi/arktype'
import type { OpenAPIV3 } from 'openapi-types'

import { createErrorResponse, createErrorResponseWithDetails } from '../../common/web/utils.js'

export type RouteDefinition = Omit<DescribeRouteOptions, 'responses'> & {
  responses: Partial<Record<StatusCode, RouteResponseDefinition>>
}

type RouteResponseDefinition = Omit<OpenAPIV3.ResponseObject, 'content'> & {
  content: {
    'application/json': Omit<OpenAPIV3.MediaTypeObject, 'schema'> & { schema: type.Any }
  }
}

type ExtractRouteResponseType<R extends RouteResponseDefinition> =
  R['content']['application/json']['schema']['infer']

export type RouteResponse<
  R extends RouteDefinition,
  // @ts-expect-error - TS isn't smart enough to recognize that keyof R['responses'] is a StatusCode
  K extends StatusCode = keyof R['responses'],
> = {
  [C in K]: TypedResponse<ExtractRouteResponseType<NonNullable<R['responses'][C]>>, C>
}[K]

export function createRoute(definition: RouteDefinition) {
  return describeRoute({
    ...definition,
    responses: Object.fromEntries(
      Object.entries(definition.responses).map(([statusCode, responseDefinition]) => [
        statusCode,
        {
          ...responseDefinition,
          content: {
            'application/json': {
              ...responseDefinition.content['application/json'],
              schema: resolver(responseDefinition.content['application/json'].schema),
            },
          },
        },
      ]),
    ),
  })
}

export const badRequestErrorResponse = createErrorResponse(type('"BadRequestError"'), type('400'))
export const unauthenticatedErrorResponse = createErrorResponse(
  type('"UnauthenticatedError"'),
  type('401'),
)
export const unauthorizedErrorResponse = createErrorResponse(
  type('"UnauthorizedError"'),
  type('403'),
)

export const routes = {
  updateMediaArtifactRelationshipType: {
    description: 'Update a media artifact relationship type',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: type({ success: 'true' }),
          },
        },
      },
      400: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: badRequestErrorResponse,
          },
        },
      },
      401: {
        description: 'Unauthenticated',
        content: {
          'application/json': {
            schema: unauthenticatedErrorResponse,
          },
        },
      },
      403: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: unauthorizedErrorResponse,
          },
        },
      },
      404: {
        description: 'Media artifact relationship type not found',
        content: {
          'application/json': {
            schema: createErrorResponseWithDetails(
              type('"MediaArtifactRelationshipTypeNotFoundError"'),
              type('404'),
              type({ id: 'string' }),
            ),
          },
        },
      },
      422: {
        description: 'Referenced media artifact type does not exist',
        content: {
          'application/json': {
            schema: createErrorResponseWithDetails(
              type('"MediaArtifactTypeNotFoundError"'),
              type('422'),
              type({ id: 'string' }),
            ),
          },
        },
      },
    },
  },
} as const satisfies Record<string, RouteDefinition>
