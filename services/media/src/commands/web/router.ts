import { Hono } from 'hono'

import type { CreateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import type { UpdateMediaArtifactRelationshipTypeCommandHandler } from '../application/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import type { CreateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/create-media-artifact-type.js'
import type { DeleteMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/delete-media-artifact-type.js'
import type { UpdateMediaArtifactTypeCommandHandler } from '../application/media-artifact-types/update-media-artifact-type.js'
import type { CreateMediaArtifactCommandHandler } from '../application/media-artifacts/create-media-artifact.js'
import type { CreateMediaTypeCommandHandler } from '../application/media-types/create-media-type.js'
import type { DeleteMediaTypeCommandHandler } from '../application/media-types/delete-media-type.js'
import type { UpdateMediaTypeCommandHandler } from '../application/media-types/update-media-type.js'
import type { IAuthenticationService } from '../domain/authentication.js'
import type { IAuthorizationService } from '../domain/authorization.js'
import { createAuthorizationMiddleware } from './authorization-middleware.js'
import { createBearerAuthMiddleware } from './bearer-auth-middleware.js'
import { createCreateMediaArtifactRelationshipTypeRoute } from './routes/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import { createUpdateMediaArtifactRelationshipTypeRoute } from './routes/media-artifact-relationship-types/update-media-artifact-relationship-type.js'
import { createCreateMediaArtifactTypeRoute } from './routes/media-artifact-types/create-media-artifact-type.js'
import { createDeleteMediaArtifactTypeRoute } from './routes/media-artifact-types/delete-media-artifact-type.js'
import { createUpdateMediaArtifactTypeRoute } from './routes/media-artifact-types/update-media-artifact-type.js'
import { createCreateMediaArtifactRoute } from './routes/media-artifacts/create-media-artifact.js'
import { createCreateMediaTypeRoute } from './routes/media-types/create-media-type.js'
import { createDeleteMediaTypeRoute } from './routes/media-types/delete-media-type.js'
import { createUpdateMediaTypeRoute } from './routes/media-types/update-media-type.js'

export type MediaCommandsRouter = ReturnType<typeof createMediaCommandsRouter>

export type MediaCommandsRouterDependencies = {
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  deleteMediaType: DeleteMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  deleteMediaArtifactType: DeleteMediaArtifactTypeCommandHandler
  createMediaArtifact: CreateMediaArtifactCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  updateMediaArtifactRelationshipType: UpdateMediaArtifactRelationshipTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaCommandsRouter({
  createMediaType,
  updateMediaType,
  deleteMediaType,
  createMediaArtifactType,
  updateMediaArtifactType,
  deleteMediaArtifactType,
  createMediaArtifact,
  createMediaArtifactRelationshipType,
  updateMediaArtifactRelationshipType,
  authentication,
  authorization,
}: MediaCommandsRouterDependencies) {
  const bearerAuth = createBearerAuthMiddleware(authentication)
  const authz = createAuthorizationMiddleware(authorization)

  const app = new Hono()
    .use(bearerAuth)
    .post('/media-types', ...createCreateMediaTypeRoute({ authz, createMediaType }))
    .put('/media-types/:id', ...createUpdateMediaTypeRoute({ authz, updateMediaType }))
    .delete('/media-types/:id', ...createDeleteMediaTypeRoute({ authz, deleteMediaType }))
    .post(
      '/media-artifact-types',
      ...createCreateMediaArtifactTypeRoute({ authz, createMediaArtifactType }),
    )
    .put(
      '/media-artifact-types/:id',
      ...createUpdateMediaArtifactTypeRoute({ authz, updateMediaArtifactType }),
    )
    .delete(
      '/media-artifact-types/:id',
      ...createDeleteMediaArtifactTypeRoute({ authz, deleteMediaArtifactType }),
    )
    .post('/media-artifacts', ...createCreateMediaArtifactRoute({ authz, createMediaArtifact }))
    .post(
      '/media-artifact-relationship-types',
      ...createCreateMediaArtifactRelationshipTypeRoute({
        authz,
        createMediaArtifactRelationshipType,
      }),
    )
    .put(
      '/media-artifact-relationship-types/:id',
      ...createUpdateMediaArtifactRelationshipTypeRoute({
        authz,
        updateMediaArtifactRelationshipType,
      }),
    )

  return app
}
