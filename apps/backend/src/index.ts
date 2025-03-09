import 'dotenv/config'

import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { createAuthenticationApplication, createAuthorizationApplication } from './application.js'
import type { Infrastructure } from './infrastructure.js'
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

  try {
    await setupDevEnvironment(infrastructure)
  } catch (error) {
    console.error('Error setting up dev environment', error)
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

async function setupDevEnvironment(infrastructure: Infrastructure) {
  const authentication = createAuthenticationApplication(infrastructure)

  const admin = await ensureAdminAccount(authentication)

  const authorization = createAuthorizationApplication(infrastructure)
  const permissions = await authorization.getAllPermissions(authorization.getSystemUserId())
  if (permissions.isErr()) throw permissions.error

  const roles = ['default', 'genre-editor', 'admin']
  for (const role of roles) {
    const result = await authorization.assignRoleToUser(
      admin.id,
      role,
      authorization.getSystemUserId(),
    )
    if (result.isErr()) throw result.error
  }
}

async function ensureAdminAccount(
  authentication: ReturnType<typeof createAuthenticationApplication>,
): Promise<{ id: number }> {
  const registerResult = await authentication.registerCommand().execute('admin', 'admin')
  if (!(registerResult instanceof Error)) return { id: registerResult.newUserAccount.id }

  const loginResult = await authentication.loginCommand().execute('admin', 'admin')
  if (!(loginResult instanceof Error)) return { id: loginResult.userAccount.id }

  throw registerResult
}

void main()
