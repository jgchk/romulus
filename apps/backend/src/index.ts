import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { createAuthenticationApplication, createAuthorizationApplication } from './application'
import type { Infrastructure } from './infrastructure'
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

  try {
    await setupDevEnvironment(infrastructure)
  } catch (error) {
    console.error('Error setting up dev environment', error)
  }

  const app = new Hono()
    .route('/authentication', getAuthenticationRouter(infrastructure))
    .route('/authorization', getAuthorizationRouter(infrastructure))
    .route('/genres', getGenresRouter(infrastructure))
    .route('/media', getMediaRouter(infrastructure))
    .route('/user-settings', getUserSettingsRouter(infrastructure))

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}

async function setupDevEnvironment(infrastructure: Infrastructure) {
  const authentication = createAuthenticationApplication(infrastructure)
  const admin = await authentication.registerCommand().execute('admin', 'admin')
  if (admin instanceof Error) throw admin

  const authorization = createAuthorizationApplication(infrastructure)
  const permissions = await authorization.getAllPermissions(authorization.getSystemUserId())
  if (permissions.isErr()) throw permissions.error

  const role = await authorization.createRole(
    'admins',
    new Set(permissions.value.map((p) => p.name)),
    undefined,
    authorization.getSystemUserId(),
  )
  if (role.isErr()) throw role.error

  const result = await authorization.assignRoleToUser(
    admin.newUserAccount.id,
    'admins',
    authorization.getSystemUserId(),
  )
  if (result.isErr()) throw result.error
}

void main()
