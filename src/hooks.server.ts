import type { Handle } from '@sveltejs/kit'

import { lucia } from '$lib/server/auth'

export const handle: Handle = async ({ event, resolve }) => {
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

  return resolve(event)
}
