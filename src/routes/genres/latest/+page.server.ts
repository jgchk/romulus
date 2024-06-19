import { db } from '$lib/server/db'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async () => {
  const genreHistory = await db.query.genreHistory.findMany({
    columns: {
      treeGenreId: true,
      name: true,
      subtitle: true,
      type: true,
      operation: true,
      createdAt: true,
    },
    orderBy: (genreHistory, { desc }) => desc(genreHistory.createdAt),
    with: {
      account: {
        columns: {
          id: true,
          username: true,
        },
      },
    },
    limit: 100,
  })

  return { genreHistory }
}
