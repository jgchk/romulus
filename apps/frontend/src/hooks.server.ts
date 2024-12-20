import { GenresPermission } from '@romulus/genres/permissions'
import type { Handle } from '@sveltejs/kit'

import { PUBLIC_API_BASE_URL } from '$env/static/public'
import { getSessionCookie, setSessionCookie } from '$lib/cookie'
import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/postgres'
import * as schema from '$lib/server/db/schema'

import { CompositionRoot } from './composition-root'

const pg = getPostgresConnection()
await migrate(getDbConnection(schema, pg))

process.on('sveltekit:shutdown', () => {
  void pg.end()
})

export const handle: Handle = async ({ event, resolve }) => {
  const dbConnection = getDbConnection(schema, pg)
  event.locals.dbConnection = dbConnection

  const sessionToken = getSessionCookie(event.cookies)
  event.locals.di = new CompositionRoot(PUBLIC_API_BASE_URL, dbConnection, sessionToken)

  if (sessionToken) {
    const whoamiResult = await event.locals.di.authentication().whoami()
    if (whoamiResult.isErr()) {
      event.locals.user = undefined
    } else {
      const account = whoamiResult.value.account
      event.locals.user = {
        id: account.id,
        username: account.username,
        permissions: {
          genres: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
            canVoteRelevance: false,
          },
        },
      }

      const permissionsResult = await event.locals.di.authorization().getMyPermissions()
      if (permissionsResult.isErr()) {
        console.error('Failed to fetch user permissions:', permissionsResult.error)
      } else {
        event.locals.user.permissions.genres = {
          canCreate: permissionsResult.value.has(GenresPermission.CreateGenres),
          canEdit: permissionsResult.value.has(GenresPermission.EditGenres),
          canDelete: permissionsResult.value.has(GenresPermission.DeleteGenres),
          canVoteRelevance: permissionsResult.value.has(GenresPermission.VoteGenreRelevance),
        }
      }

      const refreshSessionResult = await event.locals.di.authentication().refreshSession()
      if (refreshSessionResult.isErr()) {
        console.error('Failed to refresh session:', refreshSessionResult.error)
      } else {
        setSessionCookie(
          {
            token: refreshSessionResult.value.token,
            expires: refreshSessionResult.value.expiresAt,
          },
          event.cookies,
        )
      }
    }
  } else {
    event.locals.user = undefined
  }

  const response = await resolve(event)

  return response
}
