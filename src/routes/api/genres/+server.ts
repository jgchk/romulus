import { error, json, type RequestHandler } from '@sveltejs/kit'

import getManyGenres from '$lib/server/api/genres/get-many'
import { checkApiAuth } from '$lib/server/auth'

import { parseQueryParams } from './utils'

export const GET = (async ({
  url,
  locals,
  request,
}: {
  url: URL
  locals: Pick<App.Locals, 'dbConnection' | 'user'>
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

  const result = await getManyGenres(data, locals.dbConnection)

  return json(result)
}) satisfies RequestHandler
