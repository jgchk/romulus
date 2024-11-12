import type { Handle } from '@sveltejs/kit'

import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/postgres'
import { ApiCommandService } from '$lib/server/features/api/commands/command-service'
import { DrizzleApiKeyRepository } from '$lib/server/features/api/commands/infrastructure/repositories/api-key/drizzle-api-key'
import { ApiQueryService } from '$lib/server/features/api/queries/query-service'
import { LoginCommand } from '$lib/server/features/authentication/commands/application/commands/login'
import { LogoutCommand } from '$lib/server/features/authentication/commands/application/commands/logout'
import { RegisterCommand } from '$lib/server/features/authentication/commands/application/commands/register'
import { RequestPasswordResetCommand } from '$lib/server/features/authentication/commands/application/commands/request-password-reset'
import { ResetPasswordCommand } from '$lib/server/features/authentication/commands/application/commands/reset-password'
import { UpdateUserSettingsCommand } from '$lib/server/features/authentication/commands/application/commands/update-user-settings'
import { ValidatePasswordResetTokenCommand } from '$lib/server/features/authentication/commands/application/commands/validate-password-reset-token'
import { ValidateSessionCommand } from '$lib/server/features/authentication/commands/application/commands/validate-session'
import { AuthenticationCommandService } from '$lib/server/features/authentication/commands/command-service'
import { DrizzleAccountRepository } from '$lib/server/features/authentication/commands/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '$lib/server/features/authentication/commands/infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '$lib/server/features/authentication/commands/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { DrizzleSessionRepository } from '$lib/server/features/authentication/commands/infrastructure/session/drizzle-session-repository'
import { AuthenticationController } from '$lib/server/features/authentication/commands/presentation/controllers'
import { LoginController } from '$lib/server/features/authentication/commands/presentation/controllers/login'
import { LogoutController } from '$lib/server/features/authentication/commands/presentation/controllers/logout'
import { RegisterController } from '$lib/server/features/authentication/commands/presentation/controllers/register'
import { ResetPasswordController } from '$lib/server/features/authentication/commands/presentation/controllers/reset-password'
import { ValidateSessionController } from '$lib/server/features/authentication/commands/presentation/controllers/validate-session'
import { CookieCreator } from '$lib/server/features/authentication/commands/presentation/cookie'
import { AuthenticationQueryService } from '$lib/server/features/authentication/queries/query-service'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '$lib/server/features/common/infrastructure/token/crypto-token-generator'
import { CreateGenreCommand } from '$lib/server/features/genres/commands/application/commands/create-genre'
import { DeleteGenreCommand } from '$lib/server/features/genres/commands/application/commands/delete-genre'
import { UpdateGenreCommand } from '$lib/server/features/genres/commands/application/commands/update-genre'
import { VoteGenreRelevanceCommand } from '$lib/server/features/genres/commands/application/commands/vote-genre-relevance'
import { GenreCommandService } from '$lib/server/features/genres/commands/command-service'
import { DrizzleGenreHistoryRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-history-repository'
import { DrizzleGenreRelevanceVoteRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-repository'
import { DrizzleGenreTreeRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-tree-repository'
import { GenreQueryService } from '$lib/server/features/genres/queries/query-service'
import { MusicCatalogCommandService } from '$lib/server/features/music-catalog/commands/command-service'
import { DrizzleArtistRepository } from '$lib/server/features/music-catalog/commands/infrastructure/artist/drizzle-artist-repository'
import { DrizzleReleaseRepository } from '$lib/server/features/music-catalog/commands/infrastructure/release/drizzle-release-repository'
import { DrizzleReleaseIssueRepository } from '$lib/server/features/music-catalog/commands/infrastructure/release-issue/drizzle-release-issue-repository'
import { DrizzleTrackRepository } from '$lib/server/features/music-catalog/commands/infrastructure/track/drizzle-track-repository'
import { MusicCatalogQueryService } from '$lib/server/features/music-catalog/queries/query-service'

const pg = getPostgresConnection()
await migrate(getDbConnection(pg))

process.on('sveltekit:shutdown', () => {
  void pg.end()
})

const SESSION_COOKIE_NAME = 'auth_session'
const IS_SECURE = process.env.NODE_ENV === 'production'

export const handle: Handle = async ({ event, resolve }) => {
  const dbConnection = getDbConnection(pg)
  event.locals.dbConnection = dbConnection

  const accountRepo = new DrizzleAccountRepository(dbConnection)
  const sessionRepo = new DrizzleSessionRepository(dbConnection)
  const passwordResetTokenRepo = new DrizzlePasswordResetTokenRepository(dbConnection)

  const passwordHashRepo = new BcryptHashRepository()
  const sessionTokenHashRepo = new Sha256HashRepository()
  const passwordResetTokenHashRepo = new Sha256HashRepository()

  const sessionTokenGenerator = new CryptoTokenGenerator()
  const passwordResetTokenGenerator = new CryptoTokenGenerator()

  const sessionCookieCreator = new CookieCreator(SESSION_COOKIE_NAME, IS_SECURE)

  const loginCommand = new LoginCommand(
    accountRepo,
    sessionRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )
  const logoutCommand = new LogoutCommand(sessionRepo, sessionTokenHashRepo)
  const registerCommand = new RegisterCommand(
    accountRepo,
    sessionRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )
  const requestPasswordResetCommand = new RequestPasswordResetCommand(
    passwordResetTokenRepo,
    passwordResetTokenGenerator,
    passwordResetTokenHashRepo,
  )
  const resetPasswordCommand = new ResetPasswordCommand(
    accountRepo,
    sessionRepo,
    passwordResetTokenRepo,
    passwordHashRepo,
    sessionTokenHashRepo,
    sessionTokenGenerator,
  )
  const updateUserSettingsCommand = new UpdateUserSettingsCommand(accountRepo)
  const validatePasswordResetTokenCommand = new ValidatePasswordResetTokenCommand(
    passwordResetTokenRepo,
    passwordResetTokenHashRepo,
  )
  const validateSessionCommand = new ValidateSessionCommand(
    accountRepo,
    sessionRepo,
    sessionTokenHashRepo,
  )

  event.locals.controllers = {
    authentication: new AuthenticationController(
      new LoginController(loginCommand, sessionCookieCreator),
      new LogoutController(logoutCommand, sessionCookieCreator),
      new RegisterController(registerCommand, sessionCookieCreator),
      new ResetPasswordController(resetPasswordCommand, sessionCookieCreator),
      new ValidateSessionController(validateSessionCommand, sessionCookieCreator),
    ),
  }

  event.locals.services = {
    api: {
      commands: new ApiCommandService(
        new DrizzleApiKeyRepository(dbConnection),
        new CryptoTokenGenerator(),
        new Sha256HashRepository(),
      ),
      queries: new ApiQueryService(dbConnection),
    },
    authentication: {
      commands: new AuthenticationCommandService(
        loginCommand,
        logoutCommand,
        registerCommand,
        requestPasswordResetCommand,
        resetPasswordCommand,
        updateUserSettingsCommand,
        validatePasswordResetTokenCommand,
        validateSessionCommand,
      ),
      queries: new AuthenticationQueryService(dbConnection),
    },
    musicCatalog: {
      commands: new MusicCatalogCommandService(
        new DrizzleArtistRepository(dbConnection),
        new DrizzleReleaseRepository(dbConnection),
        new DrizzleReleaseIssueRepository(dbConnection),
        new DrizzleTrackRepository(dbConnection),
      ),
      queries: new MusicCatalogQueryService(dbConnection),
    },
    genre: {
      commands: new GenreCommandService(
        new CreateGenreCommand(
          new DrizzleGenreRepository(dbConnection),
          new DrizzleGenreTreeRepository(dbConnection),
          new DrizzleGenreHistoryRepository(dbConnection),
          new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
        ),
        new UpdateGenreCommand(
          new DrizzleGenreRepository(dbConnection),
          new DrizzleGenreTreeRepository(dbConnection),
          new DrizzleGenreHistoryRepository(dbConnection),
        ),
        new DeleteGenreCommand(
          new DrizzleGenreRepository(dbConnection),
          new DrizzleGenreTreeRepository(dbConnection),
          new DrizzleGenreHistoryRepository(dbConnection),
        ),
        new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
      ),
      queries: new GenreQueryService(dbConnection),
    },
  }

  const sessionToken = event.cookies.get(SESSION_COOKIE_NAME)
  event.locals.sessionToken = sessionToken

  if (!sessionToken) {
    event.locals.user = undefined
    return resolve(event)
  }

  const { account, cookie } =
    await event.locals.controllers.authentication.validateSession(sessionToken)

  event.locals.user =
    account === undefined
      ? undefined
      : {
          id: account.id,
          username: account.username,
          permissions: [...account.permissions],
          genreRelevanceFilter: account.genreRelevanceFilter,
          showRelevanceTags: account.showRelevanceTags,
          showTypeTags: account.showTypeTags,
          showNsfw: account.showNsfw,
          darkMode: account.darkMode,
        }

  if (cookie) {
    event.cookies.set(cookie.name, cookie.value, {
      path: '.',
      ...cookie.attributes,
    })
  }

  const response = await resolve(event)

  return response
}
