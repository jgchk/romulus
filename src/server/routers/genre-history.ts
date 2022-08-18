import { z } from 'zod'

import { createRouter } from '../createRouter'
import { CrudOperationInput } from '../db/common/inputs'
import { defaultGenreHistorySelect } from '../db/genre-history/outputs'
import { prisma } from '../prisma'

export const genreHistoryRouter = createRouter()
  .query('byGenreId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) =>
      prisma.genreHistory.findMany({
        where: { treeGenreId: id },
        select: defaultGenreHistorySelect,
      }),
  })
  .query('byUserId', {
    input: z.object({
      id: z.number(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.number().optional(),
    }),
    resolve: async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor, id } = input

      const history = await prisma.genreHistory.findMany({
        where: { accountId: id },
        select: defaultGenreHistorySelect,
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      })

      let nextCursor: typeof cursor | null = null
      if (history.length > limit) {
        const nextItem = history.pop()
        nextCursor = nextItem?.id ?? null
      }

      return {
        history,
        nextCursor,
      }
    },
  })
  .query('byUserId.count', {
    input: z.object({ id: z.number(), operation: CrudOperationInput }),
    resolve: async ({ input: { id, operation } }) => {
      const genres = await prisma.genreHistory.findMany({
        where: { accountId: id, operation },
        select: { treeGenreId: true },
      })

      const ids = new Set(genres.map((genre) => genre.treeGenreId))

      return { count: ids.size }
    },
  })
