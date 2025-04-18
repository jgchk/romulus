import { type } from 'arktype'

import { type RouteDefinition } from '../../../../common/web/utils.js'
import { type RouteResponse } from '../../../../common/web/utils.js'
import { createRoute } from '../../../../common/web/utils.js'
import { validator } from '../../../../common/web/utils.js'
import { factory } from '../../../../common/web/utils.js'
import type { DeleteMediaArtifactTypeCommandHandler } from '../../../application/media-artifact-types/delete-media-artifact-type.js'
import { MediaPermission } from '../../../domain/permissions.js'
import type { AuthorizationMiddleware } from '../../authorization-middleware.js'
import { unauthenticatedErrorResponse, unauthorizedErrorResponse } from '../../errors.js'

export function createDeleteMediaArtifactTypeRoute({
  authz,
  deleteMediaArtifactType,
}: DeleteMediaArtifactTypeRouteDependencies) {
  return factory.createHandlers(
    createRoute(definition),
    validator('param', type({ id: 'string' })),
    authz(MediaPermission.WriteMediaArtifactTypes),
    async (c): Promise<RouteResponse<typeof definition>> => {
      const param = c.req.valid('param')
      await deleteMediaArtifactType({ id: param.id, userId: c.var.user.id })
      return c.json({ success: true }, 200)
    },
  )
}

export type DeleteMediaArtifactTypeRouteDependencies = {
  authz: AuthorizationMiddleware
  deleteMediaArtifactType: DeleteMediaArtifactTypeCommandHandler
}

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
