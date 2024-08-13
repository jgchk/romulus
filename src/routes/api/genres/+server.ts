import { error, json, type RequestHandler } from '@sveltejs/kit'

import getManyGenres from '$lib/server/api/genres/get-many'
import { hashApiKey } from '$lib/server/api-keys'
import { ApiKeysDatabase } from '$lib/server/db/controllers/api-keys'

import { parseQueryParams } from './utils'

export const GET = (async ({
  url,
  locals,
  request,
}: {
  url: URL
  locals: Pick<App.Locals, 'dbConnection'>
  request: Request
}) => {
  const key = getKeyFromHeaders(request)
  if (key === null) {
    return error(401, 'Unauthorized')
  }

  const keyHash = await hashApiKey(key)
  const apiKeysDb = new ApiKeysDatabase()
  const maybeExistingKey = await apiKeysDb.findByKeyHash(keyHash, locals.dbConnection)
  if (!maybeExistingKey) {
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

function getKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
