import { ifDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const history = await locals.services.genre.queries.getLatestGenreUpdates()

  const genreHistory = history.map((h) => ({
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
