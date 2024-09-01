import { error } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid artist ID' })
  }
  const id = maybeId.data

  const { artist } = await locals.services.musicCatalog.queries.getArtist(id)

  if (!artist) {
    return error(404, { message: 'Artist not found' })
  }

  return { artist }
}
