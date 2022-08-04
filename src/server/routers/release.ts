import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { requireLogin } from '../guards'
import { prisma } from '../prisma'

const defaultReleaseSelect = Prisma.validator<Prisma.ReleaseSelect>()({
  id: true,
  title: true,
})

export const releaseRouter = createRouter()
  // create
  .mutation('add', {
    input: z.object({
      title: z.string(),
    }),
    resolve: ({ input, ctx }) => {
      requireLogin(ctx)

      return prisma.release.create({
        data: input,
        select: defaultReleaseSelect,
      })
    },
  })
  // read
  .query('all', {
    resolve: () => prisma.release.findMany({ select: defaultReleaseSelect }),
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id }, ctx }) => {
      requireLogin(ctx)

      const release = await prisma.release.findUnique({
        where: { id },
        select: defaultReleaseSelect,
      })

      if (!release) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No release with id '${id}'`,
        })
      }

      return release
    },
  })
  // update
  .mutation('edit', {
    input: z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
      }),
    }),
    resolve: ({ input: { id, data }, ctx }) => {
      requireLogin(ctx)

      return prisma.release.update({
        where: { id },
        data,
        select: defaultReleaseSelect,
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

      await prisma.release.delete({ where: { id } })
      return { id }
    },
  })
