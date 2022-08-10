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

      for (const genre of allGenres) {
        if (genre.history.length > 0) continue

        if (genre.contributors.length === 1) {
          const contributor = genre.contributors[0]
          await addGenreHistoryById(
            genre.id,
            GenreOperation.CREATE,
            contributor.id
          )
        } else {
          await addGenreHistoryById(
            genre.id,
            GenreOperation.CREATE,
            systemAccount.id
          )

          for (const contributor of genre.contributors) {
            await addGenreHistoryById(
              genre.id,
              GenreOperation.UPDATE,
              contributor.id
            )
          }
        }
      }
    },
  })
