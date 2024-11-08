import type { Handle } from '@sveltejs/kit'

import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/postgres'
import { ApiCommandService } from '$lib/server/features/api/commands/command-service'
import { DrizzleApiKeyRepository } from '$lib/server/features/api/commands/infrastructure/repositories/api-key/drizzle-api-key'
import { ApiQueryService } from '$lib/server/features/api/queries/query-service'
import { AuthenticationCommandService } from '$lib/server/features/authentication/commands/command-service'
import { DrizzleAccountRepository } from '$lib/server/features/authentication/commands/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '$lib/server/features/authentication/commands/infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '$lib/server/features/authentication/commands/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { DrizzleSessionRepository } from '$lib/server/features/authentication/commands/infrastructure/session/drizzle-session-repository'
import { AuthenticationQueryService } from '$lib/server/features/authentication/queries/query-service'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'
import { CryptoTokenGenerator } from '$lib/server/features/common/infrastructure/token/crypto-token-generator'
import { CreateGenreCommand } from '$lib/server/features/genres/commands/application/commands/create-genre'
import { DeleteGenreCommand } from '$lib/server/features/genres/commands/application/commands/delete-genre'
import { UpdateGenreCommand } from '$lib/server/features/genres/commands/application/commands/update-genre'
import { VoteGenreRelevanceCommand } from '$lib/server/features/genres/commands/application/commands/vote-genre-relevance'
import { GenreCommandService } from '$lib/server/features/genres/commands/command-service'
import { DrizzleGenreRelevanceVoteRepository } from '$lib/server/features/genres/commands/infrastructure/drizzle-genre-relevance-vote-repository'
import { DrizzleGenreRepository } from '$lib/server/features/genres/commands/infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '$lib/server/features/genres/commands/infrastructure/genre-history/drizzle-genre-history-repository'
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

export const handle: Handle = async ({ event, resolve }) => {
  const dbConnection = getDbConnection(pg)
  event.locals.dbConnection = dbConnection

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
        new DrizzleAccountRepository(dbConnection),
        new DrizzleSessionRepository(
          dbConnection,
          process.env.NODE_ENV === 'production',
          SESSION_COOKIE_NAME,
        ),
        new DrizzlePasswordResetTokenRepository(dbConnection),
        new BcryptHashRepository(),
        new Sha256HashRepository(),
        new CryptoTokenGenerator(),
        new Sha256HashRepository(),
        new CryptoTokenGenerator(),
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
          new DrizzleGenreHistoryRepository(dbConnection),
          new VoteGenreRelevanceCommand(new DrizzleGenreRelevanceVoteRepository(dbConnection)),
        ),
        new UpdateGenreCommand(
          new DrizzleGenreRepository(dbConnection),
          new DrizzleGenreHistoryRepository(dbConnection),
        ),
        new DeleteGenreCommand(
          new DrizzleGenreRepository(dbConnection),
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
    await event.locals.services.authentication.commands.validateSession(sessionToken)

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
