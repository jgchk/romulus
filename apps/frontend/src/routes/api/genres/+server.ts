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
    di: Pick<App.Locals['di'], 'apiCommandService' | 'genreQueryService'>
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

  const result = await locals.di.genreQueryService().getAllGenres(data)

  return json(result)
}) satisfies RequestHandler
