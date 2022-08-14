import { z } from 'zod'

import { createRouter } from '../createRouter'
import { defaultArtistHistorySelect } from '../db/artist-history/outputs'
import { CrudOperationInput } from '../db/common/inputs'
import { prisma } from '../prisma'

export const artistHistoryRouter = createRouter()
  .query('byArtistId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) =>
      prisma.artistHistory.findMany({
        where: { artistId: id },
        select: defaultArtistHistorySelect,
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

      const history = await prisma.artistHistory.findMany({
        where: { accountId: id },
        select: defaultArtistHistorySelect,
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
      const artists = await prisma.artistHistory.findMany({
        where: { accountId: id, operation },
        select: { artistId: true },
      })

      const ids = new Set(artists.map((artist) => artist.artistId))

      return { count: ids.size }
    },
  })
