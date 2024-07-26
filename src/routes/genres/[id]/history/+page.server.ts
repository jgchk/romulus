import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genreHistoryDb = new GenreHistoryDatabase(locals.dbConnection)
  const genreHistory = await genreHistoryDb.findByGenreId(id)

  return {
    genreHistory: genreHistory.map(({ akas, ...entry }) => ({
      ...entry,
      akas: akas.map((aka) => aka.name),
    })),
  }
}
