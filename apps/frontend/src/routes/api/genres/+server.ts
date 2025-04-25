import { error, json } from '@sveltejs/kit'

import { type RequestHandler } from './$types'
import { parseQueryParams } from './utils'

export const GET = (async ({ url, request, locals }) => {
  const apiKey = getApiKeyFromHeaders(request)
  if (apiKey === null) {
    return error(401, 'Unauthorized')
  }

  const validateApiKeyResult = await locals.di.authentication().validateApiKey(apiKey)
  if (validateApiKeyResult.isErr()) {
    return error(500, validateApiKeyResult.error.message)
  }

  const maybeData = parseQueryParams(url)
  if (!maybeData.success) {
    return error(400, maybeData.error)
  }
  const data = maybeData.data

  const result = await locals.di.genres().getAllGenres(data)
  if (result.isErr()) {
    return error(500, result.error.message)
  }

  return json({ data: result.value.data, pagination: result.value.pagination })
}) satisfies RequestHandler

function getApiKeyFromHeaders(request: Request) {
  const bearer = request.headers.get('authorization')
  if (!bearer) return null

  const match = /^Bearer (.+)$/.exec(bearer)
  if (!match) return null

  return match[1]
}
