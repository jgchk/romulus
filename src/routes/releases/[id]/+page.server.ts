import { error } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid release ID' })
  }
  const id = maybeId.data

  const { release } = await locals.services.musicCatalog.queries.getRelease(id)

  if (!release) {
    return error(404, { message: 'Release not found' })
  }

  return { release }
}
