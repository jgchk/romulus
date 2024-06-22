import { asc, desc } from 'drizzle-orm'

import { db } from '$lib/server/db'
import { genreHistoryAkas } from '$lib/server/db/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const genreHistory = await db.query.genreHistory.findMany({
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

  return {
    genreHistory: genreHistory.map(({ akas, ...genre }) => ({
      akas: akas.map((aka) => aka.name),
      ...genre,
    })),
  }
}
