import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../createRouter'
import { prisma } from '../prisma'
import { iso8601 } from '../../utils/validators'
import { requireLogin } from '../guards'

const defaultGenreSelect = Prisma.validator<Prisma.GenreSelect>()({
  id: true,
  name: true,
})

export const genreRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      name: z.string(),
      description: z.string(),
      location: z.union([
        z.object({ id: z.number() }),
        z.object({
          city: z.string().optional(),
          region: z.string().optional(),
          country: z.string(),
        }),
      ]),
      startDate: iso8601.optional(),
      endDate: iso8601.optional(),
    }),
    resolve: ({ input, ctx }) => {
      requireLogin(ctx)

      return prisma.genre.create({
        data: input,
        select: defaultGenreSelect,
      })
    },
  })
  // read
  .query('all', {
    resolve: () => prisma.genre.findMany({ select: defaultGenreSelect }),
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) => {
      const genre = await prisma.genre.findUnique({
        where: { id },
        select: defaultGenreSelect,
      })

      if (!genre) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No genre with id '${id}'`,
        })
      }

      return genre
    },
  })
  // update
  .mutation('edit', {
    input: z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
      }),
    }),
    resolve: ({ input: { id, data }, ctx }) => {
      requireLogin(ctx)

      return prisma.genre.update({
        where: { id },
        data,
        select: defaultGenreSelect,
      })
    },
  })
  // delete
  .mutation('delete', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)

      await prisma.genre.delete({ where: { id } })
      return { id }
    },
  })
