import { serve } from '@hono/node-server'
import { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { createAuthenticationRouter } from '@romulus/authentication/router'
import { AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
import { createAuthorizationRouter } from '@romulus/authorization/router'
import { GenresInfrastructure } from '@romulus/genres/infrastructure'
import { createGenresRouter } from '@romulus/genres/router'
import { createArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { createArtifactsRouter } from '@romulus/media/artifacts/router'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'
import { createUserSettingsRouter } from '@romulus/user-settings/router'
import { Hono } from 'hono'
import { err, ok, ResultAsync } from 'neverthrow'

import {
  createAuthenticationApplication,
  createAuthorizationApplication,
  createGenresApplication,
  createMediaApplication,
  createUserSettingsApplication,
} from './application.js'
import { setupAdminAccountForDevelopment as _setupAdminAccountForDevelopment } from './dev.js'
import { setupPermissions } from './permissions.js'

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
  const authenticationInfrastructure = await AuthenticationInfrastructure.create(
    config.authenticationDatabaseUrl,
  )
  const authorizationInfrastructure = await AuthorizationInfrastructure.create(
    config.authorizationDatabaseUrl,
  )
  const genresInfrastructure = await GenresInfrastructure.create(config.genresDatabaseUrl)
  const mediaInfrastructure = createArtifactsProjection()
  const userSettingsInfrastructure = await UserSettingsInfrastructure.create(
    config.userSettingsDatabaseUrl,
  )

  const authentication = createAuthenticationApplication({
    infrastructure: authenticationInfrastructure,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorization.checkMyPermission(permission, userId)
      },
    },
  })
  const authorization = createAuthorizationApplication(authorizationInfrastructure)
  const genres = createGenresApplication({
    infrastructure: genresInfrastructure,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorization.checkMyPermission(permission, userId)
      },
    },
  })
  const media = createMediaApplication(mediaInfrastructure)
  const userSettings = createUserSettingsApplication(userSettingsInfrastructure)

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
      authorization,
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
    .route('/media', createArtifactsRouter(media))
    .route(
      '/user-settings',
      createUserSettingsRouter({
        application: () => userSettings,
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

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}
