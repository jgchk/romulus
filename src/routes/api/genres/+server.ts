import { error, json, type RequestHandler } from '@sveltejs/kit'

import getManyGenres from '$lib/server/api/genres/get-many'

import { parseQueryParams } from './utils'

export const GET: RequestHandler = async ({ url, locals }) => {
  const maybeData = parseQueryParams(url)
  if (!maybeData.success) {
    return error(400, maybeData.error)
  }
  const data = maybeData.data

  const result = await getManyGenres(data, locals.dbConnection)

  return json(result)
}
