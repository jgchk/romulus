import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../createRouter'
import { prisma } from '../prisma'
import bcrypt from 'bcrypt'

/**
 * Default selector for Artist.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultArtistSelect = Prisma.validator<Prisma.ArtistSelect>()({
  id: true,
  name: true,
})

export const authRouter = createRouter()
  .mutation('login', {
    input: z.object({
      username: z.string(),
      password: z.string(),
    }),
    async resolve({ input }) {
      const account = await prisma.account.findUnique({
        where: { username: input.username },
        select: { password: true },
      })

      if (
        !account ||
        (await bcrypt.compare(input.password, account.password))
      ) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        })
      }
    },
  })
  // read
  .query('all', {
    async resolve() {
      /**
       * For pagination you can have a look at this docs site
       * @link https://trpc.io/docs/useInfiniteQuery
       */

      return prisma.artist.findMany({ select: defaultArtistSelect })
    },
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input: { id } }) {
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
    async resolve({ input: { id, data } }) {
      const artist = await prisma.artist.update({
        where: { id },
        data,
        select: defaultArtistSelect,
      })
      return artist
    },
  })
  // delete
  .mutation('delete', {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input: { id } }) {
      await prisma.artist.delete({ where: { id } })
      return { id }
    },
  })
