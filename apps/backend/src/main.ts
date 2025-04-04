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
  createMediaApplication,
  type MediaApplication,
  setupMediaPermissions,
} from '@romulus/media/application'
import { createMediaInfrastructure, type MediaInfrastructure } from '@romulus/media/infrastructure'
import { createMediaRouter } from '@romulus/media/web'
import type { UserSettingsApplication } from '@romulus/user-settings/application'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'
import { createUserSettingsRouter } from '@romulus/user-settings/router'
import { Hono } from 'hono'
import { requestId } from 'hono/request-id'
import { err, ok, ResultAsync } from 'neverthrow'

import {
  type AuthenticationApplication,
  createAuthenticationApplication,
  createAuthorizationApplication,
  createGenresApplication,
  createUserSettingsApplication,
  type GenresApplication,
} from './application.js'
import { createLogger } from './logger.js'

export async function main({
  config,
}: {
  config: {
    authenticationDatabaseUrl: string
    authorizationDatabaseUrl: string
    genresDatabaseUrl: string
    userSettingsDatabaseUrl: string
    mediaDatabaseUrl: string

    enableDevAdminAccount: boolean
  }
}) {
  const {
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    userSettingsInfrastructure,
    mediaInfrastructure,
  } = await createInfrastructure(config)

  const {
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    userSettingsApplication,
    mediaApplication,
  } = createApplications({
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    userSettingsInfrastructure,
    mediaInfrastructure,
  })

  const router = createRouter({
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    userSettingsApplication,
    mediaApplication,
  })

  const t: string = 5

  await setupPermissions(authorizationApplication)
  await setupRoles(authorizationApplication)

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
  mediaDatabaseUrl: string
}) {
  const authenticationInfrastructure = await AuthenticationInfrastructure.create(
    config.authenticationDatabaseUrl,
  )
  const authorizationInfrastructure = await AuthorizationInfrastructure.create(
    config.authorizationDatabaseUrl,
  )
  const genresInfrastructure = await GenresInfrastructure.create(config.genresDatabaseUrl)
  const userSettingsInfrastructure = await UserSettingsInfrastructure.create(
    config.userSettingsDatabaseUrl,
  )

  const mediaInfrastructure = await createMediaInfrastructure(config.mediaDatabaseUrl)

  return {
    authenticationInfrastructure,
    authorizationInfrastructure,
    genresInfrastructure,
    userSettingsInfrastructure,
    mediaInfrastructure,
  }
}

function createApplications({
  authenticationInfrastructure,
  authorizationInfrastructure,
  genresInfrastructure,
  userSettingsInfrastructure,
  mediaInfrastructure,
}: {
  authenticationInfrastructure: AuthenticationInfrastructure
  authorizationInfrastructure: AuthorizationInfrastructure
  genresInfrastructure: GenresInfrastructure
  userSettingsInfrastructure: UserSettingsInfrastructure
  mediaInfrastructure: MediaInfrastructure
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
  const userSettingsApplication = createUserSettingsApplication(userSettingsInfrastructure)
  const mediaApplication = createMediaApplication(
    () => mediaInfrastructure.eventStore.get('media-types'),
    (event) => mediaInfrastructure.eventStore.save('media-types', [event]),
    mediaInfrastructure.db,
  )

  return {
    authenticationApplication,
    authorizationApplication,
    genresApplication,
    userSettingsApplication,
    mediaApplication,
  }
}

function createRouter({
  authenticationApplication,
  authorizationApplication,
  genresApplication,
  userSettingsApplication,
  mediaApplication,
}: {
  authenticationApplication: AuthenticationApplication
  authorizationApplication: AuthorizationApplication
  genresApplication: GenresApplication
  userSettingsApplication: UserSettingsApplication
  mediaApplication: MediaApplication
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
  const mediaRouter = createMediaRouter({
    ...mediaApplication,
    authentication: {
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
    },
    authorization: {
      hasPermission(userId: number, permission: string) {
        return authorizationApplication.checkMyPermission(permission, userId)
      },
    },
  })

  const logger = createLogger()

  const router = new Hono()
    .use(requestId())
    .use(async (c, next) => {
      const startTime = Date.now()

      await next()

      const endTime = Date.now()

      logger.http({
        requestId: c.get('requestId'),
        request: c.req.raw,
        response: c.res,
        startTime,
        endTime,
      })
    })
    .get('/health', (c) => c.json({ success: true }))
    .route('/authentication', authenticationRouter)
    .route('/authorization', authorizationRouter)
    .route('/genres', genresRouter)
    .route('/user-settings', userSettingsRouter)
    .route('/media', mediaRouter)

  return router
}

async function setupPermissions(authorizationApplication: AuthorizationApplication) {
  await setupAuthorizationPermissions(createPermissions)
  await setupAuthenticationPermissions(createPermissions)
  await setupGenresPermissions(createPermissions)
  await setupMediaPermissions(createPermissions)

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

async function setupRoles(authorizationApplication: AuthorizationApplication) {
  const result = await authorizationApplication.setupRoles()
  if (result.isErr()) {
    console.error(result.error)
  }
}

async function setupAdminAccountForDevelopment({
  authentication,
  authorization,
}: {
  authentication: AuthenticationApplication
  authorization: AuthorizationApplication
}) {
  const admin = await ensureAdminAccountExists(authentication)
  if (admin.isErr()) {
    console.error('Error ensuring admin account exists', admin.error)
    return
  }

  const result = await assignAllRolesToAccount(authorization, admin.value.id)
  if (result.isErr()) {
    console.error('Error assigning roles to admin account', result.error)
  }
}

async function ensureAdminAccountExists(authentication: AuthenticationApplication) {
  const registerResult = await authentication.registerCommand().execute('admin', 'admin')
  if (!(registerResult instanceof Error)) return ok({ id: registerResult.newUserAccount.id })

  const loginResult = await authentication.loginCommand().execute('admin', 'admin')
  if (!(loginResult instanceof Error)) return ok({ id: loginResult.userAccount.id })

  return err(registerResult)
}

async function assignAllRolesToAccount(authorization: AuthorizationApplication, userId: number) {
  const roles = ['default', 'genre-editor', 'admin']
  for (const role of roles) {
    const result = await authorization.assignRoleToUser(
      userId,
      role,
      authorization.getSystemUserId(),
    )
    if (result.isErr()) return result
  }
  return ok(undefined)
}
