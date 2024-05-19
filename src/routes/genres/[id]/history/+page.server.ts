import { error } from '@sveltejs/kit'
import { asc, desc } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '$lib/server/db'
import { genreHistoryAkas } from '$lib/server/db/schema'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const maybeId = z.coerce.number().int().safeParse(params.id)
  if (!maybeId.success) {
    return error(400, { message: 'Invalid genre ID' })
  }
  const id = maybeId.data

  const genreHistory = await db.query.genreHistory.findMany({
    where: (genreHistory, { eq }) => eq(genreHistory.treeGenreId, id),
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
  })

  const groomedGenreHistory = genreHistory
    .sort((a, b) => {
      // always show CREATE first
      if (a.operation === 'CREATE' && b.operation !== 'CREATE') {
        return -1
      } else if (b.operation === 'CREATE' && a.operation !== 'CREATE') {
        return 1
      }

      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .map(({ akas, ...entry }) => ({
      ...entry,
      akas: akas.map((aka) => aka.name),
    }))

  return { genreHistory: groomedGenreHistory }
}
