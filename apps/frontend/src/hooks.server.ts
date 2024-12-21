import type { IAuthenticationClient } from '@romulus/authentication/client'
import type { IAuthorizationClient } from '@romulus/authorization/client'
import { GenresPermission } from '@romulus/genres/permissions'
import type { Handle } from '@sveltejs/kit'

import { PUBLIC_API_BASE_URL } from '$env/static/public'
import { getSessionCookie, setSessionCookie } from '$lib/cookie'

import { CompositionRoot } from './composition-root'

export const handle: Handle = async ({ event, resolve }) => {
  const sessionToken = getSessionCookie(event.cookies)
  event.locals.di = new CompositionRoot(PUBLIC_API_BASE_URL, sessionToken)

  event.locals.user = await getUser(
    sessionToken,
    event.locals.di.authentication(),
    event.locals.di.authorization(),
  )

  if (event.locals.user) {
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

  const response = await resolve(event)

  return response
}

async function getUser(
  sessionToken: string | undefined,
  authentication: IAuthenticationClient,
  authorization: IAuthorizationClient,
): Promise<App.Locals['user']> {
  if (sessionToken === undefined) return undefined

  const whoamiResult = await authentication.whoami()
  if (whoamiResult.isErr()) {
    return undefined
  }

  const account = whoamiResult.value.account
  const user: NonNullable<App.Locals['user']> = {
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

  const permissionsResult = await authorization.getMyPermissions()
  if (permissionsResult.isErr()) {
    console.error('Failed to fetch user permissions:', permissionsResult.error)
    return user
  }

  user.permissions.genres = {
    canCreate: permissionsResult.value.has(GenresPermission.CreateGenres),
    canEdit: permissionsResult.value.has(GenresPermission.EditGenres),
    canDelete: permissionsResult.value.has(GenresPermission.DeleteGenres),
    canVoteRelevance: permissionsResult.value.has(GenresPermission.VoteGenreRelevance),
  }
  return user
}
