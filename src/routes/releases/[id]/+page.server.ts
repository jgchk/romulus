import { error } from '@sveltejs/kit'
import { z } from 'zod'

import ReleasesDatabase from '$lib/server/db/controllers/releases'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid release ID' })
  }
  const id = maybeId.data

  const releasesDb = new ReleasesDatabase()
  const maybeRelease = await releasesDb.findById(
    id,
    { include: ['artists-full', 'tracks-full'] },
    locals.dbConnection,
  )
  if (!maybeRelease) {
    return error(404, { message: 'Release not found' })
  }
  const release = maybeRelease

  return { release }
}
