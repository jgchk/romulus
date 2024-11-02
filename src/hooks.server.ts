import type { Handle } from '@sveltejs/kit'

import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/postgres'
import { ApiService } from '$lib/server/features/api/application/api-service'
import { DrizzleApiKeyRepository } from '$lib/server/features/api/infrastructure/repositories/api-key/drizzle-api-key'
import { AuthenticationService } from '$lib/server/features/authentication/application/authentication-service'
import { DrizzleAccountRepository } from '$lib/server/features/authentication/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '$lib/server/features/authentication/infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '$lib/server/features/authentication/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { createLucia } from '$lib/server/features/authentication/infrastructure/session/lucia'
import { LuciaSessionRepository } from '$lib/server/features/authentication/infrastructure/session/lucia-session-repository'
import { CryptoTokenGenerator } from '$lib/server/features/authentication/infrastructure/token/crypto-token-generator'
import { Sha256HashRepository } from '$lib/server/features/common/infrastructure/repositories/hash/sha256-hash-repository'
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

export const handle: Handle = async ({ event, resolve }) => {
  const dbConnection = getDbConnection(pg)
  event.locals.dbConnection = dbConnection

  const lucia = createLucia(dbConnection)

  event.locals.services = {
    api: new ApiService(new DrizzleApiKeyRepository(dbConnection), new Sha256HashRepository()),
    authentication: new AuthenticationService(
      new DrizzleAccountRepository(dbConnection),
      new LuciaSessionRepository(lucia),
      new DrizzlePasswordResetTokenRepository(dbConnection),
      new BcryptHashRepository(),
      new Sha256HashRepository(),
      new CryptoTokenGenerator(),
    ),
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
        new DrizzleGenreRepository(dbConnection),
        new DrizzleGenreHistoryRepository(dbConnection),
        new DrizzleGenreRelevanceVoteRepository(dbConnection),
      ),
      queries: new GenreQueryService(dbConnection),
    },
  }

  const sessionId = event.cookies.get(lucia.sessionCookieName)

  if (!sessionId) {
    event.locals.user = undefined
    event.locals.session = undefined
    return resolve(event)
  }

  const { account, session, cookie } =
    await event.locals.services.authentication.validateSession(sessionId)

  event.locals.user =
    account === undefined
      ? undefined
      : {
          ...account,
          permissions: [...account.permissions],
        }
  event.locals.session =
    session === undefined
      ? undefined
      : {
          id: session.id,
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
