import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../createRouter'
import { prisma } from '../prisma'
import { check, iso8601 } from '../../utils/validators'
import { requireLogin } from '../guards'
import { defaultGenreSelect } from '../db/genre'

const LocationId = z.object({ id: z.number() })
const LocationData = z.object({
  city: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  country: z.string().min(1),
})

export const genreRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      name: z.string().min(1),
      description: z.string().min(1).optional(),
      locations: z.union([LocationId, LocationData]).array().optional(),
      startDate: iso8601.optional(),
      endDate: iso8601.optional(),
      parentGenres: z.number().array().optional(),
      childGenres: z.number().array().optional(),
    }),
    resolve: async ({ input, ctx }) => {
      requireLogin(ctx)

      const locationIds = input.locations
        ? await Promise.all(
            input.locations.map(async (location) => {
              if (check(LocationId, location)) {
                return location.id
              }

              const dbLocation = await prisma.location.create({
                data: location,
                select: { id: true },
              })

              return dbLocation.id
            })
          )
        : undefined

      return prisma.genre.create({
        data: {
          name: input.name,
          description: input.description,
          locations: locationIds
            ? { connect: locationIds.map((id) => ({ id })) }
            : undefined,
          startDate: input.startDate,
          endDate: input.endDate,
          parentGenres: input.parentGenres
            ? { connect: input.parentGenres.map((id) => ({ id })) }
            : undefined,
          childGenres: input.childGenres
            ? { connect: input.childGenres.map((id) => ({ id })) }
            : undefined,
        },
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
