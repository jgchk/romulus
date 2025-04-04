import { Hono } from 'hono'

import type { CreateMediaTypeCommandHandler } from './commands/application/create-media-type.js'
import type { UpdateMediaTypeCommandHandler } from './commands/application/update-media-type.js'
import type { IAuthenticationService } from './commands/domain/authentication.js'
import type { IAuthorizationService } from './commands/domain/authorization.js'
import { createMediaCommandsRouter } from './commands/web/router.js'
import type { GetAllMediaTypesQueryHandler } from './queries/application/get-all-media-types.js'
import { createMediaQueriesRouter } from './queries/web/router.js'

export type MediaRouterDependencies = {
  getAllMediaTypes: GetAllMediaTypesQueryHandler
  createMediaType: CreateMediaTypeCommandHandler
  updateMediaType: UpdateMediaTypeCommandHandler
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaRouter(dependencies: MediaRouterDependencies) {
  return new Hono()
    .route('/', createMediaCommandsRouter(dependencies))
    .route('/', createMediaQueriesRouter(dependencies))
}
