import type { Handle } from '@sveltejs/kit'

import { createLucia } from '$lib/server/auth'
import { getDbConnection, getPostgresConnection } from '$lib/server/db/connection/postgres'
import { AuthService } from '$lib/server/ddd/features/auth/application/auth-service'
import { DrizzleAccountRepository } from '$lib/server/ddd/features/auth/infrastructure/account/drizzle-account-repository'
import { BcryptHashRepository } from '$lib/server/ddd/features/auth/infrastructure/hash/bcrypt-hash-repository'
import { Sha256HashRepository } from '$lib/server/ddd/features/auth/infrastructure/hash/sha256-hash-repository'
import { DrizzlePasswordResetTokenRepository } from '$lib/server/ddd/features/auth/infrastructure/password-reset-token/drizzle-password-reset-token-repository'
import { LuciaSessionRepository } from '$lib/server/ddd/features/auth/infrastructure/session/lucia-session-repository'
import { GenreService } from '$lib/server/ddd/features/genres/application/genre-service'
import { DrizzleGenreRepository } from '$lib/server/ddd/features/genres/infrastructure/genre/drizzle-genre-repository'
import { DrizzleGenreHistoryRepository } from '$lib/server/ddd/features/genres/infrastructure/genre-history/drizzle-genre-history-repository'
import { MusicCatalogService } from '$lib/server/ddd/features/music-catalog/application/music-catalog-service'
import { DrizzleArtistRepository } from '$lib/server/ddd/features/music-catalog/infrastructure/artist/drizzle-artist-repository'
import { DrizzleReleaseRepository } from '$lib/server/ddd/features/music-catalog/infrastructure/release/drizzle-release-repository'
import { DrizzleTrackRepository } from '$lib/server/ddd/features/music-catalog/infrastructure/track/drizzle-track-repository'

const pg = getPostgresConnection()

process.on('sveltekit:shutdown', () => {
  void pg.end()
})

export const handle: Handle = async ({ event, resolve }) => {
  const dbConnection = getDbConnection(pg)
  event.locals.dbConnection = dbConnection

  const lucia = createLucia(dbConnection)
  event.locals.lucia = lucia

  event.locals.services = {
    authService: new AuthService(
      new DrizzleAccountRepository(dbConnection),
      new LuciaSessionRepository(lucia),
      new DrizzlePasswordResetTokenRepository(dbConnection),
      new BcryptHashRepository(),
      new Sha256HashRepository(),
    ),
    musicCatalogService: new MusicCatalogService(
      new DrizzleArtistRepository(dbConnection),
      new DrizzleReleaseRepository(dbConnection),
      new DrizzleTrackRepository(dbConnection),
    ),
    genreService: new GenreService(
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
    await event.locals.services.authService.validateSession(sessionId)

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
