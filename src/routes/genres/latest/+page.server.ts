import { and, asc, desc, eq, lt } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { genreHistory, genreHistoryAkas } from '$lib/server/db/schema'
import { ifDefined } from '$lib/utils/types'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const results = await db.query.genreHistory.findMany({
    columns: {
      id: true,
      treeGenreId: true,
      name: true,
      subtitle: true,
      type: true,
      operation: true,
      createdAt: true,
      shortDescription: true,
      longDescription: true,
      notes: true,
      parentGenreIds: true,
      influencedByGenreIds: true,
    },
    orderBy: (genreHistory, { desc }) => desc(genreHistory.createdAt),
    with: {
      akas: {
        columns: { name: true },
        orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
      },
      account: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    limit: 100,
  })

  const history = await Promise.all(
    results.map(async ({ akas, ...genre }) => {
      const maybePreviousHistory = await db.query.genreHistory.findFirst({
        where: and(
          eq(genreHistory.treeGenreId, genre.treeGenreId),
          lt(genreHistory.createdAt, genre.createdAt),
        ),
        orderBy: desc(genreHistory.createdAt),
        with: {
          akas: {
            columns: { name: true },
            orderBy: [desc(genreHistoryAkas.relevance), asc(genreHistoryAkas.order)],
          },
        },
      })

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
