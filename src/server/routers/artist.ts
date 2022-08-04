/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { requireLogin } from '../guards'
import { prisma } from '../prisma'

/**
 * Default selector for Artist.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultArtistSelect = Prisma.validator<Prisma.ArtistSelect>()({
  id: true,
  name: true,
})

export const artistRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      name: z.string(),
    }),
    resolve: ({ input, ctx }) => {
      requireLogin(ctx)

      return prisma.artist.create({
        data: input,
        select: defaultArtistSelect,
      })
    },
  })
  // read
  .query('all', {
    resolve: () => prisma.artist.findMany({ select: defaultArtistSelect }),
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) => {
      const artist = await prisma.artist.findUnique({
        where: { id },
        select: defaultArtistSelect,
      })

      if (!artist) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No artist with id '${id}'`,
        })
      }

      return artist
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
    resolve: async ({ input: { id, data }, ctx }) => {
      requireLogin(ctx)

      return prisma.artist.update({
        where: { id },
        data,
        select: defaultArtistSelect,
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

      await prisma.artist.delete({ where: { id } })
      return { id }
    },
  })
