import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { createAuthorizationApplication } from './application'
import { createInfrastructure } from './infrastructure'
import { setupPermissions } from './permissions'
import {
  getAuthenticationRouter,
  getAuthorizationRouter,
  getGenresRouter,
  getMediaRouter,
  getUserSettingsRouter,
} from './web'

async function main() {
  const infrastructure = await createInfrastructure()

  const authorization = createAuthorizationApplication(infrastructure)
  await setupPermissions(async (permissions) => {
    const result = await authorization.ensurePermissions(
      permissions,
      authorization.getSystemUserId(),
    )

    if (result.isErr()) {
      throw result.error
    }
  })

  const app = new Hono()
    .route('/authentication', getAuthenticationRouter(infrastructure))
    .route('/authorization', getAuthorizationRouter(infrastructure))
    .route('/genres', getGenresRouter(infrastructure))
    .route('/media', getMediaRouter(infrastructure))
    .route('/user-settings', getUserSettingsRouter(infrastructure))

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}

void main()
