import { error, json, type RequestHandler } from '@sveltejs/kit'

import getManyArtists from '$lib/server/api/artists/get-many'
import { checkApiAuth } from '$lib/server/auth'

import { parseQueryParams } from './utils'

export const GET = (async ({
  url,
  locals,
  request,
}: {
  url: URL
  locals: Pick<App.Locals, 'user' | 'dbConnection'>
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

  const result = await getManyArtists(data, locals.dbConnection)

  return json(result)
}) satisfies RequestHandler
