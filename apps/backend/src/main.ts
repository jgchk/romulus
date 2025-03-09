import { serve } from '@hono/node-server'
import { setupAuthenticationPermissions } from '@romulus/authentication/application'
import { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { createAuthenticationRouter } from '@romulus/authentication/router'
import {
  type AuthorizationApplication,
  setupAuthorizationPermissions,
} from '@romulus/authorization/application'
import { AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
import { createAuthorizationRouter } from '@romulus/authorization/router'
import { setupGenresPermissions } from '@romulus/genres/application'
import { GenresInfrastructure } from '@romulus/genres/infrastructure'
import { createGenresRouter } from '@romulus/genres/router'
import {
  type ArtifactsProjection,
  createArtifactsProjection,
} from '@romulus/media/artifacts/infrastructure'
import { createArtifactsRouter } from '@romulus/media/artifacts/router'
import type { UserSettingsApplication } from '@romulus/user-settings/application'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'
import { createUserSettingsRouter } from '@romulus/user-settings/router'
import { Hono } from 'hono'
import { err, ok, ResultAsync } from 'neverthrow'

import {
  type AuthenticationApplication,
  createAuthenticationApplication,
  createAuthorizationApplication,
  createGenresApplication,
  createMediaApplication,
  createUserSettingsApplication,
  type GenresApplication,
  type MediaApplication,
} from './application.js'
import { setupAdminAccountForDevelopment as _setupAdminAccountForDevelopment } from './dev.js'

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
  const {
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    mediaInfrastructure,
    userSettingsInfrastructure,
  } = await createInfrastructure(config)

  const {
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    mediaApplication,
    userSettingsApplication,
  } = createApplications({
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    mediaInfrastructure,
    userSettingsInfrastructure,
  })

  const router = createRouter({
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    mediaApplication,
    userSettingsApplication,
  })

  await setupPermissions(authorizationApplication)

  const result = await authorizationApplication.setupRoles()
  if (result.isErr()) {
    console.error(result.error)
  }

  if (config.enableDevAdminAccount) {
    await setupAdminAccountForDevelopment({
      authentication: authenticationApplication,
      authorization: authorizationApplication,
    })
  }

  serve(router, (info) => console.log(`Backend running on ${info.port}`))
}

async function createInfrastructure(config: {
  authenticationDatabaseUrl: string
  authorizationDatabaseUrl: string
  genresDatabaseUrl: string
  userSettingsDatabaseUrl: string
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

  return {
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    mediaInfrastructure,
    userSettingsInfrastructure,
  }
}

function createApplications({
  authenticationInfrastructure,
  authorizationInfrastructure,
  genresInfrastructure,
  mediaInfrastructure,
  userSettingsInfrastructure,
}: {
  authenticationInfrastructure: AuthenticationInfrastructure
  authorizationInfrastructure: AuthorizationInfrastructure
  genresInfrastructure: GenresInfrastructure
  mediaInfrastructure: ArtifactsProjection
  userSettingsInfrastructure: UserSettingsInfrastructure
}) {
  const authenticationApplication = createAuthenticationApplication({
    infrastructure: authenticationInfrastructure,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorizationApplication.checkMyPermission(permission, userId)
      },
    },
  })
  const authorizationApplication = createAuthorizationApplication(authorizationInfrastructure)
  const genresApplication = createGenresApplication({
    infrastructure: genresInfrastructure,
    authorizationService: {
      hasPermission(userId: number, permission: string) {
        return authorizationApplication.checkMyPermission(permission, userId)
      },
    },
  })
  const mediaApplication = createMediaApplication(mediaInfrastructure)
  const userSettingsApplication = createUserSettingsApplication(userSettingsInfrastructure)

  return {
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    mediaApplication,
    userSettingsApplication,
  }
}

function createRouter({
  authenticationApplication,
  authorizationApplication,
  genresApplication,
  mediaApplication,
  userSettingsApplication,
}: {
  authenticationApplication: AuthenticationApplication
  authorizationApplication: AuthorizationApplication
  genresApplication: GenresApplication
  mediaApplication: MediaApplication
  userSettingsApplication: UserSettingsApplication
}) {
  const authenticationRouter = createAuthenticationRouter(authenticationApplication)
  const authorizationRouter = createAuthorizationRouter({
    application: () => authorizationApplication,
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = authenticationApplication.whoamiQuery()

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
  })
  const genresRouter = createGenresRouter({
    ...genresApplication,
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = authenticationApplication.whoamiQuery()

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
  })
  const mediaRouter = createArtifactsRouter(mediaApplication)
  const userSettingsRouter = createUserSettingsRouter({
    application: () => userSettingsApplication,
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = authenticationApplication.whoamiQuery()

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
  })

  const router = new Hono()
    .get('/health', (c) => c.json({ success: true }))
    .route('/authentication', authenticationRouter)
    .route('/authorization', authorizationRouter)
    .route('/genres', genresRouter)
    .route('/media', mediaRouter)
    .route('/user-settings', userSettingsRouter)

  return router
}

async function setupPermissions(authorizationApplication: AuthorizationApplication) {
  await setupAuthorizationPermissions(createPermissions)
  await setupAuthenticationPermissions(createPermissions)
  await setupGenresPermissions(createPermissions)

  async function createPermissions(
    permissions: { name: string; description: string | undefined }[],
  ) {
    const result = await authorizationApplication.ensurePermissions(
      permissions,
      authorizationApplication.getSystemUserId(),
    )

    if (result.isErr()) {
      throw result.error
    }
  }
}
