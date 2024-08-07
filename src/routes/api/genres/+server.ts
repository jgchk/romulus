import { error, json, type RequestHandler } from '@sveltejs/kit'

import getManyGenres from '$lib/server/api/genres/get-many'

import { parseQueryParams } from './utils'

export const GET = (async ({
  url,
  locals,
}: {
  url: URL
  locals: Pick<App.Locals, 'dbConnection'>
}) => {
  return error(401, 'Unauthorized')

  const maybeData = parseQueryParams(url)
  if (!maybeData.success) {
    return error(400, maybeData.error)
  }
  const data = maybeData.data

  const result = await getManyGenres(data, locals.dbConnection)

  return json(result)
}) satisfies RequestHandler
