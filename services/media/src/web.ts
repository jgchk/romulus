import { Hono } from 'hono'

import type { CreateMediaArtifactRelationshipTypeCommandHandler } from './commands/application/media-artifact-relationship-types/create-media-artifact-relationship-type.js'
import type { CreateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/create-media-artifact-type.js'
import type { UpdateMediaArtifactTypeCommandHandler } from './commands/application/media-artifact-types/update-media-artifact-type.js'
import type { CreateMediaTypeCommandHandler } from './commands/application/media-types/create-media-type.js'
import type { UpdateMediaTypeCommandHandler } from './commands/application/media-types/update-media-type.js'
import type { IAuthenticationService } from './commands/domain/authentication.js'
import type { IAuthorizationService } from './commands/domain/authorization.js'
import { createMediaCommandsRouter } from './commands/web/router.js'
import type { GetMediaArtifactRelationshipTypeQueryHandler } from './queries/application/media-artifact-relationship-types/get-media-artifact-relationship-type.js'
import type { GetAllMediaArtifactTypesQueryHandler } from './queries/application/media-artifact-types/get-all-media-artifact-types.js'
import type { GetMediaArtifactTypeQueryHandler } from './queries/application/media-artifact-types/get-media-artifact-type.js'
import type { GetAllMediaTypesQueryHandler } from './queries/application/media-types/get-all-media-types.js'
import type { GetMediaTypeQueryHandler } from './queries/application/media-types/get-media-type.js'
import { createMediaQueriesRouter } from './queries/web/router.js'

export type MediaRouterDependencies = {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  getMediaType: GetMediaTypeQueryHandler
  getAllMediaArtifactTypes: GetAllMediaArtifactTypesQueryHandler
  getMediaArtifactType: GetMediaArtifactTypeQueryHandler
  getMediaArtifactRelationshipType: GetMediaArtifactRelationshipTypeQueryHandler
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  createMediaArtifactType: CreateMediaArtifactTypeCommandHandler
  updateMediaArtifactType: UpdateMediaArtifactTypeCommandHandler
  createMediaArtifactRelationshipType: CreateMediaArtifactRelationshipTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaRouter(dependencies: MediaRouterDependencies) {
  return new Hono()
    .route('/commands', createMediaCommandsRouter(dependencies))
    .route('/queries', createMediaQueriesRouter(dependencies))
}
