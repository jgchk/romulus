import { json } from '@sveltejs/kit'

import { stringifyTreeGenre } from '$lib/features/genres/serialization'

import type { RequestHandler } from './$types'

export const GET = (async ({ locals }) => {
  const genres = await locals.di
    .genres()
    .getGenreTree()
    .then((res) => {
      if (res.isErr()) throw res.error
      return res.value.tree
    })

  const output = json({ genres: genres.map((genre) => stringifyTreeGenre(genre)) })

  return output
}) satisfies RequestHandler
