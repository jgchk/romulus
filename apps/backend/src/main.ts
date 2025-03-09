import { serve } from '@hono/node-server'
import { createAuthenticationRouter } from '@romulus/authentication/router'
import { createAuthorizationRouter } from '@romulus/authorization/router'
import { createGenresRouter } from '@romulus/genres/router'
import { Hono } from 'hono'
import { err, ok, ResultAsync } from 'neverthrow'

import {
  createAuthenticationApplication,
  createAuthorizationApplication,
  createGenresApplication,
} from './application.js'
import { setupAdminAccountForDevelopment as _setupAdminAccountForDevelopment } from './dev.js'
import { createInfrastructure } from './infrastructure.js'
import { setupPermissions } from './permissions.js'
import { getMediaRouter, getUserSettingsRouter } from './web.js'

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

  const authentication = createAuthenticationApplication(infrastructure)
  const authorization = createAuthorizationApplication(infrastructure)
  const genres = createGenresApplication(infrastructure)

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
      authentication,
      authorization: createAuthorizationApplication(infrastructure),
    })
  }

  const app = new Hono()
    .get('/health', (c) => c.json({ success: true }))
    .route('/authentication', createAuthenticationRouter(authentication))
    .route(
      '/authorization',
      createAuthorizationRouter({
        application: () => authorization,
        authentication: () => ({
          whoami: (token: string) => {
            const whoamiQuery = authentication.whoamiQuery()

            // eslint-disable-next-line returned-errors/enforce-error-handling
            return ResultAsync.fromSafePromise(whoamiQuery.execute(token)).andThen((res) => {
              if (res instanceof Error) {
                return err(res)
              } else {
                return ok({ id: res.account.id })
              }
            })
          },
        }),
      }),
    )
    .route(
      '/genres',
      createGenresRouter({
        ...genres,
        authentication: () => ({
          whoami: (token: string) => {
            const whoamiQuery = authentication.whoamiQuery()

            // eslint-disable-next-line returned-errors/enforce-error-handling
            return ResultAsync.fromSafePromise(whoamiQuery.execute(token)).andThen((res) => {
              if (res instanceof Error) {
                return err(res)
              } else {
                return ok({ id: res.account.id })
              }
            })
          },
        }),
      }),
    )
    .route('/media', getMediaRouter(infrastructure))
    .route('/user-settings', getUserSettingsRouter(infrastructure))

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}
