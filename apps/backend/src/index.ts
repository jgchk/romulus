import { serve } from '@hono/node-server'
import {
  CreateApiKeyCommand,
  DeleteApiKeyCommand,
  GetAccountQuery,
  GetAccountsQuery,
  GetApiKeysByAccountQuery,
  LoginCommand,
  LogoutCommand,
  RefreshSessionCommand,
  RegisterCommand,
  RequestPasswordResetCommand,
  ResetPasswordCommand,
  ValidateApiKeyCommand,
  WhoamiQuery,
} from '@romulus/authentication/application'
import { AuthenticationInfrastructure } from '@romulus/authentication/infrastructure'
import { createAuthenticationRouter } from '@romulus/authentication/router'
import { AuthorizationApplication } from '@romulus/authorization/application'
import { AuthorizationInfrastructure } from '@romulus/authorization/infrastructure'
import { createAuthorizationRouter } from '@romulus/authorization/router'
import {
  CreateGenreCommand,
  DeleteGenreCommand,
  GetAllGenresQuery,
  GetGenreHistoryByAccountQuery,
  GetGenreHistoryQuery,
  GetGenreQuery,
  GetGenreRelevanceVoteByAccountQuery,
  GetGenreRelevanceVotesByGenreQuery,
  GetGenreTreeQuery,
  GetLatestGenreUpdatesQuery,
  GetRandomGenreIdQuery,
  UpdateGenreCommand,
  VoteGenreRelevanceCommand,
} from '@romulus/genres/application'
import { GenresInfrastructure } from '@romulus/genres/infrastructure'
import { createGenresRouter } from '@romulus/genres/router'
import { createArtifactsProjection } from '@romulus/media/artifacts/infrastructure'
import { createArtifactsRouter } from '@romulus/media/artifacts/router'
import { UserSettingsApplication } from '@romulus/user-settings/application'
import { UserSettingsInfrastructure } from '@romulus/user-settings/infrastructure'
import { createUserSettingsRouter } from '@romulus/user-settings/router'
import { Hono } from 'hono'
import { err, ok, ResultAsync } from 'neverthrow'
import {
  createDefineArtifactSchemaCommandHandler,
  createDefineRelationSchemaCommandHandler,
  createRegisterArtifactCommandHandler,
  createRegisterRelationCommandHandler,
} from '@romulus/media/artifacts/application'

async function main() {
  const authenticationInfrastructure = await AuthenticationInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/authn',
  )

  const authorizationInfrastructure = await AuthorizationInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/authz',
  )

  const genresInfrastructure = await GenresInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/genres',
  )

  const mediaInfrastructure = createArtifactsProjection()

  const userSettingsInfrastructure = await UserSettingsInfrastructure.create(
    'postgresql://postgres:postgres@localhost:5432/user_settings',
  )

  const authenticationRouter = createAuthenticationRouter({
    loginCommand: () =>
      new LoginCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    logoutCommand: () =>
      new LogoutCommand(
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    registerCommand: () =>
      new RegisterCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    requestPasswordResetCommand: () =>
      new RequestPasswordResetCommand(
        authenticationInfrastructure.passwordResetTokenRepo(),
        authenticationInfrastructure.passwordResetTokenGenerator(),
        authenticationInfrastructure.passwordResetTokenHashRepo(),
        authenticationInfrastructure.accountRepo(),
        {
          hasPermission: (userId, permission) =>
            new AuthorizationApplication(
              authorizationInfrastructure.authorizerRepo(),
            ).checkMyPermission(permission, userId),
        },
      ),
    resetPasswordCommand: () =>
      new ResetPasswordCommand(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.passwordResetTokenRepo(),
        authenticationInfrastructure.passwordResetTokenHashRepo(),
        authenticationInfrastructure.passwordHashRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
        authenticationInfrastructure.sessionTokenGenerator(),
      ),
    whoamiQuery: () =>
      new WhoamiQuery(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    getAccountQuery: () => new GetAccountQuery(authenticationInfrastructure.accountRepo()),
    getAccountsQuery: () => new GetAccountsQuery(authenticationInfrastructure.accountRepo()),
    refreshSessionCommand: () =>
      new RefreshSessionCommand(
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    createApiKeyCommand: () =>
      new CreateApiKeyCommand(
        authenticationInfrastructure.apiKeyRepo(),
        authenticationInfrastructure.apiKeyTokenGenerator(),
        authenticationInfrastructure.apiKeyHashRepo(),
      ),
    deleteApiKeyCommand: () => new DeleteApiKeyCommand(authenticationInfrastructure.apiKeyRepo()),
    getApiKeysByAccountQuery: () =>
      new GetApiKeysByAccountQuery(authenticationInfrastructure.dbConnection()),
    validateApiKeyCommand: () =>
      new ValidateApiKeyCommand(
        authenticationInfrastructure.apiKeyRepo(),
        authenticationInfrastructure.apiKeyHashRepo(),
      ),
  })

  const authorizationRouter = createAuthorizationRouter({
    application: () => new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = new WhoamiQuery(
          authenticationInfrastructure.accountRepo(),
          authenticationInfrastructure.sessionRepo(),
          authenticationInfrastructure.sessionTokenHashRepo(),
        )
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
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = new WhoamiQuery(
          authenticationInfrastructure.accountRepo(),
          authenticationInfrastructure.sessionRepo(),
          authenticationInfrastructure.sessionTokenHashRepo(),
        )
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
    createGenreCommand: () =>
      new CreateGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        {
          hasPermission: (userId, permission) =>
            new AuthorizationApplication(
              authorizationInfrastructure.authorizerRepo(),
            ).checkMyPermission(permission, userId),
        },
      ),
    deleteGenreCommand: () =>
      new DeleteGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        {
          hasPermission: (userId, permission) =>
            new AuthorizationApplication(
              authorizationInfrastructure.authorizerRepo(),
            ).checkMyPermission(permission, userId),
        },
      ),
    updateGenreCommand: () =>
      new UpdateGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        {
          hasPermission: (userId, permission) =>
            new AuthorizationApplication(
              authorizationInfrastructure.authorizerRepo(),
            ).checkMyPermission(permission, userId),
        },
      ),
    voteGenreRelevanceCommand: () =>
      new VoteGenreRelevanceCommand(genresInfrastructure.genreRelevanceVoteRepo(), {
        hasPermission: (userId, permission) =>
          new AuthorizationApplication(
            authorizationInfrastructure.authorizerRepo(),
          ).checkMyPermission(permission, userId),
      }),
    getAllGenresQuery: () => new GetAllGenresQuery(genresInfrastructure.dbConnection()),
    getGenreHistoryByAccountQuery: () =>
      new GetGenreHistoryByAccountQuery(genresInfrastructure.dbConnection()),
    getGenreHistoryQuery: () => new GetGenreHistoryQuery(genresInfrastructure.dbConnection()),
    getGenreRelevanceVoteByAccountQuery: () =>
      new GetGenreRelevanceVoteByAccountQuery(genresInfrastructure.dbConnection()),
    getGenreRelevanceVotesByGenreQuery: () =>
      new GetGenreRelevanceVotesByGenreQuery(genresInfrastructure.dbConnection()),
    getGenreTreeQuery: () => new GetGenreTreeQuery(genresInfrastructure.dbConnection()),
    getGenreQuery: () => new GetGenreQuery(genresInfrastructure.dbConnection()),
    getLatestGenreUpdatesQuery: () =>
      new GetLatestGenreUpdatesQuery(genresInfrastructure.dbConnection()),
    getRandomGenreIdQuery: () => new GetRandomGenreIdQuery(genresInfrastructure.dbConnection()),
  })

  const mediaRouter = createArtifactsRouter({
    handleDefineArtifactSchemaCommand: createDefineArtifactSchemaCommandHandler(async (event) => {
      mediaInfrastructure.applyEvent(event)
    }),
    handleDefineRelationSchemaCommand: createDefineRelationSchemaCommandHandler(async (event) => {
      mediaInfrastructure.applyEvent(event)
    }),
    handleRegisterArtifactCommand: createRegisterArtifactCommandHandler(
      async (id) => {
        return mediaInfrastructure.get().artifactSchemas.get(id)
      },
      async (event) => {
        mediaInfrastructure.applyEvent(event)
      },
    ),
    handleRegisterRelationCommand: createRegisterRelationCommandHandler(
      async (ids: { schemaId: string; sourceArtifactId: string; targetArtifactId: string }) => {
        const schema = mediaInfrastructure.get().relationSchemas.get(ids.schemaId)
        const sourceArtifact = mediaInfrastructure.get().artifacts.get(ids.sourceArtifactId)
        const targetArtifact = mediaInfrastructure.get().artifacts.get(ids.targetArtifactId)
        return { schema, sourceArtifact, targetArtifact }
      },
      async (event) => {
        mediaInfrastructure.applyEvent(event)
      },
    ),
  })

  const userSettingsRouter = createUserSettingsRouter({
    application: () =>
      new UserSettingsApplication(userSettingsInfrastructure.userSettingsRepository()),
    authentication: () => ({
      whoami: (token: string) => {
        const whoamiQuery = new WhoamiQuery(
          authenticationInfrastructure.accountRepo(),
          authenticationInfrastructure.sessionRepo(),
          authenticationInfrastructure.sessionTokenHashRepo(),
        )
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

  const app = new Hono()
    .route('/authentication', authenticationRouter)
    .route('/authorization', authorizationRouter)
    .route('/genres', genresRouter)
    .route('/media', mediaRouter)
    .route('/user-settings', userSettingsRouter)

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}

void main()
