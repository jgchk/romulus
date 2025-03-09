import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { createAuthorizationApplication } from './application.js'
import { setupAdminAccountForDevelopment } from './dev.js'
import { env } from './env.js'
import { createInfrastructure } from './infrastructure.js'
import { setupPermissions } from './permissions.js'
import {
  getAuthenticationRouter,
  getAuthorizationRouter,
  getGenresRouter,
  getMediaRouter,
  getUserSettingsRouter,
} from './web.js'

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

  const result = await authorization.setupRoles()
  if (result.isErr()) {
    console.error(result.error)
  }

  if (env.ENABLE_DEV_ADMIN_ACCOUNT) {
    await setupAdminAccountForDevelopment(infrastructure)
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

void main()
