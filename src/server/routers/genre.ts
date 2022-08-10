import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { check, iso8601 } from '../../utils/validators'
import { createRouter } from '../createRouter'
import { defaultGenreSelect } from '../db/genre'
import { requireLogin, requirePermission } from '../guards'
import { prisma } from '../prisma'

const LocationId = z.object({ id: z.number() })
const LocationData = z.object({
  city: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  country: z.string().min(1),
})

const GenreType = z.union([
  z.literal('MOVEMENT'),
  z.literal('META'),
  z.literal('STYLE'),
  z.literal('SCENE'),
  z.literal('TREND'),
])

type BasicGenre = {
  id: number
  name: string
  parentGenres: {
    id: number
  }[]
}

const detectCycleInner = (
  id: number,
  stack: number[],
  allGenresMap: Record<number, BasicGenre>
): number[] | false => {
  if (stack.includes(id)) {
    return [...stack, id]
  }

  const genre = allGenresMap[id]
  const parentIds = genre.parentGenres.map((g) => g.id)

  for (const parentId of parentIds) {
    const cycle = detectCycleInner(parentId, [...stack, id], allGenresMap)
    if (cycle) {
      return cycle
    }
  }

  return false
}

const detectCycle = async (data: {
  id?: number
  name: string
  parentGenres?: number[]
  childGenres?: number[]
}) => {
  let allGenres: BasicGenre[] = await prisma.genre.findMany({
    select: { id: true, name: true, parentGenres: { select: { id: true } } },
  })

  // if the user has made any updates to parent/child genres,
  // temporarily apply those updates before checking for cycles
  const id = data.id ?? -1
  if (!allGenres.some((genre) => genre.id === id)) {
    allGenres.push({
      id,
      name: data.name,
      parentGenres: data.parentGenres?.map((id) => ({ id })) ?? [],
    })
  }

  if (data.parentGenres) {
    const parentGenres = data.parentGenres
    allGenres = allGenres.map((genre) =>
      genre.id === data.id
        ? { ...genre, parentGenres: parentGenres.map((id) => ({ id })) }
        : genre
    )
  }
  if (data.childGenres) {
    const childGenres = data.childGenres
    allGenres = allGenres.map((genre) =>
      childGenres.includes(genre.id)
        ? { ...genre, parentGenres: [...genre.parentGenres, { id }] }
        : genre
    )
  }

  const allGenresMap: Record<number, BasicGenre> = Object.fromEntries(
    allGenres.map((genre) => [genre.id, genre])
  )

  for (const genre of allGenres) {
    const cycle = detectCycleInner(genre.id, [], allGenresMap)
    if (cycle) {
      const formattedCycle = cycle
        .map((id) => allGenresMap[id].name)
        .join(' → ')
      return formattedCycle
    }
  }

  return false
}

export const throwOnCycle = async (data: {
  id?: number
  name: string
  parentGenres?: number[]
  childGenres?: number[]
}) => {
  const cycle = await detectCycle(data)
  if (cycle) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Cycle detected in genre tree:\n${cycle}`,
    })
  }
}

export const genreRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      name: z.string().min(1),
      type: GenreType,
      shortDescription: z.string().min(1).optional(),
      longDescription: z.string().min(1).optional(),
      locations: z.union([LocationId, LocationData]).array().optional(),
      startDate: iso8601.optional(),
      endDate: iso8601.optional(),
      parentGenres: z.number().array().optional(),
      childGenres: z.number().array().optional(),
      influencedByGenres: z.number().array().optional(),
      influencesGenres: z.number().array().optional(),
      notes: z.string().min(1).optional(),
      akas: z.string().min(1).array(),
    }),
    resolve: async ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)

      await throwOnCycle(input)

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
          ...input,
          locations: locationIds
            ? { connect: locationIds.map((id) => ({ id })) }
            : undefined,
          parentGenres: input.parentGenres
            ? { connect: input.parentGenres.map((id) => ({ id })) }
            : undefined,
          childGenres: input.childGenres
            ? { connect: input.childGenres.map((id) => ({ id })) }
            : undefined,
          influencedByGenres: input.influencedByGenres
            ? { connect: input.influencedByGenres.map((id) => ({ id })) }
            : undefined,
          influencesGenres: input.influencesGenres
            ? { connect: input.influencesGenres.map((id) => ({ id })) }
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
        type: GenreType,
        shortDescription: z.string().min(1).optional().nullable(),
        longDescription: z.string().min(1).optional().nullable(),
        locations: z.union([LocationId, LocationData]).array().optional(),
        startDate: iso8601.optional(),
        endDate: iso8601.optional(),
        parentGenres: z.number().array().optional(),
        childGenres: z.number().array().optional(),
        influencedByGenres: z.number().array().optional(),
        influencesGenres: z.number().array().optional(),
        x: z.number().nullable().optional(),
        y: z.number().nullable().optional(),
        notes: z.string().min(1).optional().nullable(),
        akas: z.string().min(1).array().optional(),
      }),
    }),
    resolve: async ({ input: { id, data }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_GENRES)

      await throwOnCycle({ id, ...data })

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
          influencedByGenres: data.influencedByGenres
            ? { set: data.influencedByGenres.map((id) => ({ id })) }
            : undefined,
          influencesGenres: data.influencesGenres
            ? { set: data.influencesGenres.map((id) => ({ id })) }
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

      const genre = await prisma.genre.findUnique({
        where: { id },
        select: {
          parentGenres: { select: { id: true } },
          childGenres: { select: { id: true } },
        },
      })
      if (!genre) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No genre with id '${id}'`,
        })
      }

      await prisma.$transaction([
        ...genre.childGenres.flatMap((childGenre) =>
          genre.parentGenres.map((parentGenre) =>
            prisma.genre.update({
              where: { id: childGenre.id },
              data: { parentGenres: { connect: { id: parentGenre.id } } },
            })
          )
        ),
        prisma.genre.delete({ where: { id } }),
      ])

      return { id }
    },
  })
