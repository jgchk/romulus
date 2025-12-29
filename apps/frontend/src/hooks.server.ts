import type { AuthenticationClient } from '@romulus/authentication/client'
import type { AuthorizationClient } from '@romulus/authorization/client'
import { AuthorizationPermission } from '@romulus/authorization/permissions'
import { GenresPermission } from '@romulus/genres/permissions'
import { MediaPermission } from '@romulus/media/permissions'
import type { Handle, HandleFetch, HandleServerError } from '@sveltejs/kit'

import { env } from '$env/dynamic/private'
import { getSessionCookie, setSessionCookie } from '$lib/cookie'
import { createLogger } from '$lib/server/logger'

import { createCompositionRoot } from './composition-root'

const API_BASE_URL = env.API_BASE_URL
if (API_BASE_URL === undefined) {
  console.error('API_BASE_URL is required')
  process.exit(1)
}

const logger = createLogger()

export const handle: Handle = async ({ event, resolve }) => {
  const startTime = Date.now()

  event.locals.requestId = event.request.headers.get('X-Request-Id') ?? crypto.randomUUID()

  const sessionToken = getSessionCookie(event.cookies)
  event.locals.di = createCompositionRoot({
    baseUrl: API_BASE_URL,
    sessionToken,
    fetch: event.fetch,
  })

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
  const endTime = Date.now()

  logger.http({
    requestId: event.locals.requestId,
    request: event.request,
    response: response,
    startTime,
    endTime,
  })

  return response
}

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
  request.headers.set('X-Request-Id', event.locals.requestId)

  return fetch(request)
}

export const handleError: HandleServerError = ({ error, event, status, message }) => {
  logger.error({ error, event, status, message })
}

async function getUser(
  sessionToken: string | undefined,
  authentication: AuthenticationClient,
  authorization: AuthorizationClient,
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
      mediaTypes: {
        canCreate: false,
      },
      mediaArtifactTypes: {
        canCreate: false,
      },
      genreEditors: {
        canManage: false,
      },
    },
  }

  const permissionsResult = await authorization.getMyPermissions()
  if (permissionsResult.isErr()) {
    console.error('Failed to fetch user permissions:', permissionsResult.error)
    return user
  }
  const permissions = permissionsResult.value.permissions

  user.permissions = {
    genres: {
      canCreate: permissions.has(GenresPermission.CreateGenres),
      canEdit: permissions.has(GenresPermission.EditGenres),
      canDelete: permissions.has(GenresPermission.DeleteGenres),
      canVoteRelevance: permissions.has(GenresPermission.VoteGenreRelevance),
    },
    mediaTypes: {
      canCreate: permissions.has(MediaPermission.WriteMediaTypes),
    },
    mediaArtifactTypes: {
      canCreate: permissions.has(MediaPermission.WriteMediaArtifactTypes),
    },
    genreEditors: {
      canManage: permissions.has(AuthorizationPermission.ManageGenreEditors),
    },
  }

  return user
}
