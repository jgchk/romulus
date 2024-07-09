import { error } from '@sveltejs/kit'
import { z } from 'zod'

import { db } from '$lib/server/db'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genreHistory = await db.genreHistory.findByGenreId(id)

  return {
    genreHistory: genreHistory.map(({ akas, ...entry }) => ({
      ...entry,
      akas: akas.map((aka) => aka.name),
    })),
  }
}
