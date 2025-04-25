import { json } from '@sveltejs/kit'

import { stringifyTreeGenre } from '$lib/features/genres/serialization'

import { type RequestHandler } from './$types'

export const GET = (async ({ locals }) => {
  console.time('genre-tree/server all')

  console.time('genre-tree/server a')
  const genres = await locals.di
    .genres()
    .getGenreTree()
    .then((res) => {
      if (res.isErr()) throw res.error
      return res.value.tree
    })
  console.timeEnd('genre-tree/server a')

  console.time('genre-tree/server b')
  const output = json({ genres: genres.map((genre) => stringifyTreeGenre(genre)) })
  console.timeEnd('genre-tree/server b')

  console.timeEnd('genre-tree/server all')

  return output
}) satisfies RequestHandler
