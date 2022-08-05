import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { check, iso8601 } from '../../utils/validators'
import { createRouter } from '../createRouter'
import { defaultGenreSelect } from '../db/genre'
import { requireLogin } from '../guards'
import { prisma } from '../prisma'

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
      shortDescription: z.string().min(1).optional(),
      longDescription: z.string().min(1).optional(),
      locations: z.union([LocationId, LocationData]).array().optional(),
      startDate: iso8601.optional(),
      endDate: iso8601.optional(),
      parentGenres: z.number().array().optional(),
      childGenres: z.number().array().optional(),
    }),
    resolve: async ({ input, ctx }) => {
      const { account } = requireLogin(ctx)

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
          shortDescription: input.shortDescription,
          longDescription: input.longDescription,
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
          contributors: { connect: { id: account.id } },
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
        name: z.string().min(1),
        shortDescription: z.string().min(1).optional().nullable(),
        longDescription: z.string().min(1).optional().nullable(),
        locations: z.union([LocationId, LocationData]).array().optional(),
        startDate: iso8601.optional(),
        endDate: iso8601.optional(),
        parentGenres: z.number().array().optional(),
        childGenres: z.number().array().optional(),
        x: z.number().nullable().optional(),
        y: z.number().nullable().optional(),
      }),
    }),
    resolve: ({ input: { id, data }, ctx }) => {
      const { account } = requireLogin(ctx)

      return prisma.genre.update({
        where: { id },
        data: {
          ...data,
          parentGenres: data.parentGenres
            ? { set: data.parentGenres.map((id) => ({ id })) }
            : undefined,
          childGenres: data.childGenres
            ? { set: data.childGenres.map((id) => ({ id })) }
            : undefined,
          contributors: { connect: { id: account.id } },
        },
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
