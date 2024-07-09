import { db } from '$lib/server/db'
import { ifDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const results = await db.genreHistory.findLatest()

  const history = await Promise.all(
    results.map(async ({ akas, ...genre }) => {
      const maybePreviousHistory = await db.genreHistory.findPreviousByGenreId(
        genre.treeGenreId,
        genre.createdAt,
      )

      const previousHistory = ifDefined(maybePreviousHistory, ({ akas, ...ph }) => ({
        akas: akas.map((aka) => aka.name),
        ...ph,
      }))

      return {
        akas: akas.map((aka) => aka.name),
        previousHistory,
        ...genre,
      }
    }),
  )

  return { genreHistory: history }
}
