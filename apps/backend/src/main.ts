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
  const infrastructure = await createInfrastructure({
    authenticationDatabaseUrl: config.authenticationDatabaseUrl,
    authorizationDatabaseUrl: config.authorizationDatabaseUrl,
    genresDatabaseUrl: config.genresDatabaseUrl,
    userSettingsDatabaseUrl: config.userSettingsDatabaseUrl,
  })

  const authentication = createAuthenticationApplication({
    infrastructure: infrastructure.authentication,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorization.checkMyPermission(permission, userId)
      },
    },
  })
  const authorization = createAuthorizationApplication(infrastructure.authorization)
  const genres = createGenresApplication({
    infrastructure: infrastructure.genres,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorization.checkMyPermission(permission, userId)
      },
    },
  })
  const media = createMediaApplication(infrastructure.media)
  const userSettings = createUserSettingsApplication(infrastructure.userSettings)

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

async function createInfrastructure({
  authenticationDatabaseUrl,
  authorizationDatabaseUrl,
  genresDatabaseUrl,
  userSettingsDatabaseUrl,
}: {
  authenticationDatabaseUrl: string
  authorizationDatabaseUrl: string
  genresDatabaseUrl: string
  userSettingsDatabaseUrl: string
}) {
  const authentication = await AuthenticationInfrastructure.create(authenticationDatabaseUrl)
  const authorization = await AuthorizationInfrastructure.create(authorizationDatabaseUrl)
  const genres = await GenresInfrastructure.create(genresDatabaseUrl)
  const media = createArtifactsProjection()
  const userSettings = await UserSettingsInfrastructure.create(userSettingsDatabaseUrl)

  return { authentication, authorization, genres, media, userSettings }
}
