import { type } from 'arktype'

import type { DeleteMediaTypeCommandHandler } from '../../../application/media-types/delete-media-type.js'
import { MediaPermission } from '../../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../../authorization-middleware.js'
import { unauthenticatedErrorResponse, unauthorizedErrorResponse } from '../../errors.js'
import { type RouteDefinition } from '../common.js'
import { type RouteResponse } from '../common.js'
import { createRoute } from '../common.js'
import { factory, validator } from '../common.js'

export function createDeleteMediaTypeRoute({
  authz,
  deleteMediaType,
}: DeleteMediaTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    authz(MediaPermission.WriteMediaTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const param = c.req.valid('param')
      await deleteMediaType({ id: param.id })
      return c.json({ success: true }, 200)
    },
  )
}

export type DeleteMediaTypeRouteDependencies = {
  authz: AuthorizationMiddleware
  deleteMediaType: DeleteMediaTypeCommandHandler
}

const definition = {
  description: 'Delete a media type',
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: type({ success: 'true' }),
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
  },
} satisfies RouteDefinition
