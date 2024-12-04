import { error } from '@sveltejs/kit'
import { z } from 'zod'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genreHistory = await locals.di.genreQueryService().getGenreHistory(id)

  return { genreHistory }
}
