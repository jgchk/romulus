import { GenreHistoryDatabase } from '$lib/server/db/controllers/genre-history'
import { ifDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const genreHistoryDb = new GenreHistoryDatabase()
  const results = await genreHistoryDb.findLatest(locals.dbConnection)

  const history = await Promise.all(
    results.map(async ({ akas, ...genre }) => {
      const maybePreviousHistory = await genreHistoryDb.findPreviousByGenreId(
        genre.treeGenreId,
        genre.createdAt,
        locals.dbConnection,
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
