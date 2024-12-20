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
    di: Pick<App.Locals['di'], 'apiCommandService'> & {
      genres: () => {
        queries: () => {
          getAllGenres: ReturnType<IGenresClient['queries']>['getAllGenres']
        }
      }
    }
  }
  request: Request
}) => {
  const isAuthed = await checkApiAuth(request, locals)
  if (!isAuthed) {
    return error(401, 'Unauthorized')
  }

  const maybeData = parseQueryParams(url)
  if (!maybeData.success) {
    return error(400, maybeData.error)
  }
  const data = maybeData.data

  const result = await locals.di.genres().queries().getAllGenres(data)
  if (result instanceof Error) {
    return error(result.originalError.statusCode, result.message)
  }

  return json({ data: result.data, pagination: result.pagination })
}) satisfies RequestHandler
