import { type } from 'arktype'

import type { DeleteMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/delete-media-artifact-type.js'
import { MediaPermission } from '../../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../../authorization-middleware.js'
import {
  createRoute,
  type RouteDefinition,
  type RouteResponse,
  unauthenticatedErrorResponse,
  unauthorizedErrorResponse,
} from '../../routes.js'
import { factory, validator } from '../common.js'

const definition = {
  description: 'Delete a media artifact type',
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

export function createDeleteMediaArtifactTypeRoute({
  authz,
  deleteMediaArtifactType,
}: {
  authz: AuthorizationMiddleware
  deleteMediaArtifactType: DeleteMediaArtifactTypeCommandHandler
}) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    authz(MediaPermission.WriteMediaArtifactTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const param = c.req.valid('param')
      await deleteMediaArtifactType({ id: param.id })
      return c.json({ success: true }, 200)
    },
  )
}
