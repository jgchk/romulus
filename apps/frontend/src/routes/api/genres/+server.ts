import type { IAuthenticationClient } from '@romulus/authentication/client'
import type { IGenresClient } from '@romulus/genres/client'
import { error, json, type RequestHandler } from '@sveltejs/kit'

import { checkApiAuth } from '$lib/server/auth'

import { parseQueryParams } from './utils'

export const GET = (async ({
  url,
  locals,
  request,
}: {
  url: URL
  locals: {
    dbConnection: App.Locals['dbConnection']
    user: App.Locals['user']
    di: {
      authentication: () => {
        validateApiKey: IAuthenticationClient['validateApiKey']
      }
      genres: () => {
        getAllGenres: IGenresClient['getAllGenres']
      }
    }
  }
  request: Request
}) => {
  const isAuthed = await checkApiAuth(request, locals)
  if (isAuthed.isErr()) {
    return error(500, isAuthed.error.message)
  }
  if (!isAuthed.value) {
    return error(401, 'Unauthorized')
  }

  const maybeData = parseQueryParams(url)
  if (!maybeData.success) {
    return error(400, maybeData.error)
  }
  const data = maybeData.data

  const result = await locals.di.genres().getAllGenres(data)
  if (result instanceof Error) {
    return error(result.originalError.statusCode, result.message)
  }

  return json({ data: result.data, pagination: result.pagination })
}) satisfies RequestHandler
