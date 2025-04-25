import { Hono } from 'hono'

import { type MediaApplication } from './application.js'
import { type IAuthenticationService } from './commands/domain/authentication.js'
import { type IAuthorizationService } from './commands/domain/authorization.js'
import { createMediaCommandsRouter } from './commands/web/router.js'
import { createMediaQueriesRouter } from './queries/web/router.js'

export type MediaRouterDependencies = MediaApplication & {
  authentication: IAuthenticationService
  authorization: IAuthorizationService
}

export function createMediaRouter(dependencies: MediaRouterDependencies) {
  return new Hono()
    .route('/commands', createMediaCommandsRouter(dependencies))
    .route('/queries', createMediaQueriesRouter(dependencies))
}
