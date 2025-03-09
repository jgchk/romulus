import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { createAuthenticationApplication, createAuthorizationApplication } from './application.js'
import { setupAdminAccountForDevelopment as _setupAdminAccountForDevelopment } from './dev.js'
import { createInfrastructure } from './infrastructure.js'
import { setupPermissions } from './permissions.js'
import {
  getAuthenticationRouter,
  getAuthorizationRouter,
  getGenresRouter,
  getMediaRouter,
  getUserSettingsRouter,
} from './web.js'

export async function main({
  config,
  setupAdminAccountForDevelopment = _setupAdminAccountForDevelopment,
}: {
  config: {
    authenticationDatabaseUrl: string
    authorizationDatabaseUrl: string
    genresDatabaseUrl: string
    userSettingsDatabaseUrl: string

    enableDevAdminAccount: boolean
  }
  setupAdminAccountForDevelopment?: typeof _setupAdminAccountForDevelopment
}) {
  const infrastructure = await createInfrastructure({
    authenticationDatabaseUrl: config.authenticationDatabaseUrl,
    authorizationDatabaseUrl: config.authorizationDatabaseUrl,
    genresDatabaseUrl: config.genresDatabaseUrl,
    userSettingsDatabaseUrl: config.userSettingsDatabaseUrl,
  })

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

  const result = await authorization.setupRoles()
  if (result.isErr()) {
    console.error(result.error)
  }

  if (config.enableDevAdminAccount) {
    await setupAdminAccountForDevelopment({
      authentication: createAuthenticationApplication(infrastructure),
      authorization: createAuthorizationApplication(infrastructure),
    })
  }

  const app = new Hono()
    .get('/health', (c) => c.json({ success: true }))
    .route('/authentication', getAuthenticationRouter(infrastructure))
    .route('/authorization', getAuthorizationRouter(infrastructure))
    .route('/genres', getGenresRouter(infrastructure))
    .route('/media', getMediaRouter(infrastructure))
    .route('/user-settings', getUserSettingsRouter(infrastructure))

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}
