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
  if (!isAuthed) {
    return error(401, 'Unauthorized')
  }

  const maybeTitleQuery = z.string().safeParse(url.searchParams.get('title'))
  if (!maybeTitleQuery.success) {
    return error(400, maybeTitleQuery.error)
  }
  const titleQuery = maybeTitleQuery.data

  const { tracks } = await locals.services.musicCatalog.queries.searchTracks(titleQuery)

  return json({ tracks })
}) satisfies RequestHandler
