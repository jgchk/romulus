import { z } from 'zod'

import { createRouter } from '../createRouter'
import { CrudOperationInput } from '../db/common/inputs'
import { defaultReleaseHistorySelect } from '../db/release-history/outputs'
import { prisma } from '../prisma'

export const releaseHistoryRouter = createRouter()
  .query('byReleaseId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) =>
      prisma.releaseHistory.findMany({
        where: { releaseId: id },
        select: defaultReleaseHistorySelect,
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

      const history = await prisma.releaseHistory.findMany({
        where: { accountId: id },
        select: defaultReleaseHistorySelect,
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
      const releases = await prisma.releaseHistory.findMany({
        where: { accountId: id, operation },
        select: { releaseId: true },
      })

      const ids = new Set(releases.map((release) => release.releaseId))

      return { count: ids.size }
    },
  })
