import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createRouter } from '../createRouter'
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
    async resolve({ input }) {
      const release = await prisma.release.create({
        data: input,
        select: defaultReleaseSelect,
      })
      return release
    },
  })
  // read
  .query('all', {
    async resolve() {
      return prisma.release.findMany({ select: defaultReleaseSelect })
    },
  })
  .query('byId', {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input: { id } }) {
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
    async resolve({ input: { id, data } }) {
      const release = await prisma.release.update({
        where: { id },
        data,
        select: defaultReleaseSelect,
      })
      return release
    },
  })
  // delete
  .mutation('delete', {
    input: z.object({
      id: z.number(),
    }),
    async resolve({ input: { id } }) {
      await prisma.release.delete({ where: { id } })
      return { id }
    },
  })
