import type { Handle } from '@sveltejs/kit'

import { createLucia } from '$lib/server/auth'
import { getDbConnection, getPostgresConnection } from '$lib/server/db/connection/postgres'
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

  event.locals.services = {
    musicCatalogService: new MusicCatalogService(
      new DrizzleArtistRepository(dbConnection),
      new DrizzleReleaseRepository(dbConnection),
      new DrizzleTrackRepository(dbConnection),
    ),
  }

  const lucia = createLucia(dbConnection)
  event.locals.lucia = lucia

  const sessionId = event.cookies.get(lucia.sessionCookieName)

  if (!sessionId) {
    event.locals.user = undefined
    event.locals.session = undefined
    return resolve(event)
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (session?.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id)
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })
  }

  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie()
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: '.',
      ...sessionCookie.attributes,
    })
  }

  event.locals.user = user ?? undefined
  event.locals.session = session ?? undefined

  const response = await resolve(event)

  return response
}
