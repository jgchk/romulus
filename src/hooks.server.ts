import type { Handle } from '@sveltejs/kit'

import { lucia } from '$lib/server/auth'
import { getDbConnection, getPostgresConnection } from '$lib/server/db/connection'

export const handle: Handle = async ({ event, resolve }) => {
  const pg = getPostgresConnection()
  event.locals.dbConnection = getDbConnection(pg)

  const sessionId = event.cookies.get(lucia.sessionCookieName)

  if (!sessionId) {
    event.locals.user = undefined
    event.locals.session = undefined
    return resolve(event)
  }

  const { session, user } = await lucia.validateSession(sessionId)

  if (session && session.fresh) {
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

  await pg.end()

  return response
}
