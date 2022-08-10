import { GenreOperation, Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { defaultGenreHistorySelect } from '../db/genre/types'
import { addGenreHistoryById } from '../db/genre/utils'
import { env } from '../env'
import { requirePermission } from '../guards'
import { prisma } from '../prisma'

export const genreHistoryRouter = createRouter()
  .query('byGenreId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: ({ input: { id } }) =>
      prisma.genreHistory.findMany({
        where: { treeGenreId: id },
        select: defaultGenreHistorySelect,
      }),
  })
  .query('byUserId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) =>
      prisma.genreHistory.findMany({
        where: { accountId: id },
        select: defaultGenreHistorySelect,
      }),
  })
  .mutation('migrateContributors', {
    resolve: async ({ ctx }) => {
      requirePermission(ctx, Permission.MIGRATE_CONTRIBUTORS)

      const systemAccount =
        (await prisma.account.findUnique({
          where: { username: env.SYSTEM_USERNAME },
        })) ??
        (await prisma.account.create({
          data: {
            username: env.SYSTEM_USERNAME,
            password: env.SYSTEM_PASSWORD,
          },
        }))

      const allGenres = await prisma.genre.findMany({
        include: { history: true, contributors: true },
      })

      await Promise.all(
        allGenres.flatMap(async (genre) => {
          if (genre.history.length > 0) return

          if (genre.contributors.length === 1) {
            const contributor = genre.contributors[0]
            return addGenreHistoryById(
              genre.id,
              GenreOperation.CREATE,
              contributor.id
            )
          } else {
            return [
              addGenreHistoryById(
                genre.id,
                GenreOperation.CREATE,
                systemAccount.id
              ),
              ...genre.contributors.map((contributor) =>
                addGenreHistoryById(
                  genre.id,
                  GenreOperation.UPDATE,
                  contributor.id
                )
              ),
            ]
          }
        })
      )
    },
  })
