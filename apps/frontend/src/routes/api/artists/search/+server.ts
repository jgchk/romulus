import { error, json, type RequestHandler } from '@sveltejs/kit'
import { z } from 'zod'

import { checkApiAuth } from '$lib/server/auth'

export const GET = (async ({
  url,
  locals,
  request,
}: {
  url: URL
  locals: App.Locals
  request: Request
}) => {
  const isAuthed = await checkApiAuth(request, locals)
  if (isAuthed.isErr()) {
    return error(500, isAuthed.error.message)
  }
  if (!isAuthed.value) {
    return error(401, 'Unauthorized')
  }

  const maybeNameQuery = z.string().safeParse(url.searchParams.get('name'))
  if (!maybeNameQuery.success) {
    return error(400, maybeNameQuery.error)
  }
  const nameQuery = maybeNameQuery.data

  const { artists } = await locals.di.musicCatalogQueryService().searchArtists(nameQuery)

  return json({ artists })
}) satisfies RequestHandler
