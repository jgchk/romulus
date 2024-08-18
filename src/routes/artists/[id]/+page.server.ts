import { error } from '@sveltejs/kit'
import { z } from 'zod'

import ArtistsDatabase from '$lib/server/db/controllers/artists'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid artist ID' })
  }
  const id = maybeId.data

  const artistsDb = new ArtistsDatabase()
  const maybeArtist = await artistsDb.findById(
    id,
    { include: ['releases-full', 'tracks-full'] },
    locals.dbConnection,
  )
  if (!maybeArtist) {
    return error(404, { message: 'Artist not found' })
  }
  const artist = maybeArtist

  return { artist }
}
