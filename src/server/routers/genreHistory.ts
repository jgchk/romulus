import { GenreOperation, Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { defaultGenreHistorySelect } from '../db/genre/outputs'
import { addGenreHistoryById } from '../db/genre/utils'
import { requirePermission } from '../guards'
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
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) =>
      prisma.genreHistory.findMany({
        where: { accountId: id },
        select: defaultGenreHistorySelect,
      }),
  })
  .mutation('giveCreateCredit', {
    input: z.object({ genreId: z.number(), accountId: z.number() }),
    resolve: async ({ ctx, input }) => {
      requirePermission(ctx, Permission.MIGRATE_CONTRIBUTORS)

      const createAction = await prisma.genreHistory.findFirst({
        where: { treeGenreId: input.genreId, operation: GenreOperation.CREATE },
        select: { id: true, account: { select: { username: true } } },
      })

      if (!createAction) {
        return addGenreHistoryById(
          input.genreId,
          GenreOperation.CREATE,
          input.accountId
        )
      }

      await prisma.genreHistory.update({
        where: { id: createAction.id },
        data: { accountId: input.accountId },
        select: null,
      })
    },
  })
