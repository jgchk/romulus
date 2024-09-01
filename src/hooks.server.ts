import type { Handle } from '@sveltejs/kit'

import { getDbConnection, getPostgresConnection } from '$lib/server/db/connection/postgres'
import { ApiService } from '$lib/server/layers/features/api/application/api-service'
import { DrizzleApiKeyRepository } from '$lib/server/layers/features/api/infrastructure/repositories/api-key/drizzle-api-key'
import { AuthenticationService } from '$lib/server/layers/features/authentication/application/authentication-service'
import { DrizzleAccountRepository } from '$lib/server/layers/features/authentication/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '$lib/server/layers/features/authentication/infrastructure/hash/bcrypt-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '$lib/server/layers/features/authentication/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { createLucia } from '$lib/server/layers/features/authentication/infrastructure/session/lucia'
import { LuciaSessionRepository } from '$lib/server/layers/features/authentication/infrastructure/session/lucia-session-repository'
import { CryptoTokenGenerator } from '$lib/server/layers/features/authentication/infrastructure/token/crypto-token-generator'
import { Sha256HashRepository } from '$lib/server/layers/features/common/infrastructure/repositories/hash/sha256-hash-repository'
import { GenreService } from '$lib/server/layers/features/genres/application/genre-service'
import { DrizzleGenreRepository } from '$lib/server/layers/features/genres/infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '$lib/server/layers/features/genres/infrastructure/genre-history/drizzle-genre-history-repository'
import { MusicCatalogService } from '$lib/server/layers/features/music-catalog/application/music-catalog-service'
import { DrizzleArtistRepository } from '$lib/server/layers/features/music-catalog/infrastructure/artist/drizzle-artist-repository'
import { DrizzleReleaseRepository } from '$lib/server/layers/features/music-catalog/infrastructure/release/drizzle-release-repository'
import { DrizzleTrackRepository } from '$lib/server/layers/features/music-catalog/infrastructure/track/drizzle-track-repository'

const pg = getPostgresConnection()

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
    musicCatalog: new MusicCatalogService(
      new DrizzleArtistRepository(dbConnection),
      new DrizzleReleaseRepository(dbConnection),
      new DrizzleTrackRepository(dbConnection),
    ),
    genre: new GenreService(
      new DrizzleGenreRepository(dbConnection),
      new DrizzleGenreHistoryRepository(dbConnection),
    ),
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
