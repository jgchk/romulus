import { json } from '@sveltejs/kit'
import { stringify } from 'devalue'

import { createGenreStore } from '$lib/features/genres/queries/infrastructure'

import type { RequestHandler } from './$types'

export const GET = (async ({ locals }) => {
  const genres = await locals.di
    .genres()
    .getGenreTree()
    .then((res) => {
      if (res.isErr()) throw res.error
      return res.value.tree
    })
    .then((genres) => createGenreStore(genres))

  return json({ genres: stringify(genres) })
}) satisfies RequestHandler
