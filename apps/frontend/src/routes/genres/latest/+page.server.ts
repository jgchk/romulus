import { error } from '@sveltejs/kit'

import { ifDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const response = await locals.di.genres().queries().getLatestGenreUpdates()
  if (response instanceof Error) {
    return error(response.originalError.statusCode, response.message)
  }

  const genreHistory = response.latestUpdates.map((h) => ({
    ...h,
    genre: {
      ...h.genre,
      akas: [...h.genre.akas.primary, ...h.genre.akas.secondary, ...h.genre.akas.tertiary],
    },
    previousHistory: ifDefined(h.previousHistory, (ph) => ({
      ...ph,
      akas: [...ph.akas.primary, ...ph.akas.secondary, ...ph.akas.tertiary],
    })),
  }))

  return { genreHistory }
}
