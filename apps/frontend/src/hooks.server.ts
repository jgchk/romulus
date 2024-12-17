import { AuthenticationClientError } from '@romulus/authentication'
import type { Handle } from '@sveltejs/kit'

import { PUBLIC_API_BASE_URL } from '$env/static/public'
import { getSessionCookie, setSessionCookie } from '$lib/cookie'
import { getDbConnection, getPostgresConnection, migrate } from '$lib/server/db/connection/postgres'
import * as schema from '$lib/server/db/schema'

import { CompositionRoot } from './composition-root'
import { AuthorizationPermission } from '@romulus/authorization'
import { GenresPermission } from '@romulus/genres'

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
    if (whoamiResult instanceof AuthenticationClientError) {
      event.locals.user = undefined
    } else {
      const account = whoamiResult.account
      event.locals.user = {
        id: account.id,
        username: account.username,
        genreRelevanceFilter: account.genreRelevanceFilter,
        showRelevanceTags: account.showRelevanceTags,
        showTypeTags: account.showTypeTags,
        showNsfw: account.showNsfw,
        darkMode: account.darkMode,
        permissions: {
          genres: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        },
      }

      const permissionsResult = await event.locals.di.authorization().getUserPermissions(account.id)
      if (permissionsResult instanceof Error) {
        console.error('Failed to fetch user permissions:', permissionsResult)
      } else {
        event.locals.user.permissions.genres = {
          canCreate: permissionsResult.permissions.has(GenresPermission.CreateGenres),
          canEdit: permissionsResult.permissions.has(GenresPermission.EditGenres),
          canDelete: permissionsResult.permissions.has(GenresPermission.DeleteGenres),
        }
      }

      const refreshSessionResult = await event.locals.di.authentication().refreshSession()
      if (refreshSessionResult instanceof AuthenticationClientError) {
        console.error('Failed to refresh session:', refreshSessionResult)
      } else {
        setSessionCookie(
          {
            token: refreshSessionResult.token,
            expires: new Date(refreshSessionResult.expiresAt),
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
