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
import { Hono } from 'hono'

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
        new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
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
  })

  const authorizationRouter = createAuthorizationRouter({
    application: () => new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
    whoami: () =>
      new WhoamiQuery(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
  })

  const genresRouter = createGenresRouter({
    whoamiQuery: () =>
      new WhoamiQuery(
        authenticationInfrastructure.accountRepo(),
        authenticationInfrastructure.sessionRepo(),
        authenticationInfrastructure.sessionTokenHashRepo(),
      ),
    createGenreCommand: () =>
      new CreateGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
      ),
    deleteGenreCommand: () =>
      new DeleteGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
      ),
    updateGenreCommand: () =>
      new UpdateGenreCommand(
        genresInfrastructure.genreRepo(),
        genresInfrastructure.genreTreeRepo(),
        genresInfrastructure.genreHistoryRepo(),
        new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
      ),
    voteGenreRelevanceCommand: () =>
      new VoteGenreRelevanceCommand(
        genresInfrastructure.genreRelevanceVoteRepo(),
        new AuthorizationApplication(authorizationInfrastructure.authorizerRepo()),
      ),
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

  const app = new Hono()
    .route('/authentication', authenticationRouter)
    .route('/authorization', authorizationRouter)
    .route('/genres', genresRouter)

  serve(app, (info) => console.log(`Backend running on ${info.port}`))
}

void main()
