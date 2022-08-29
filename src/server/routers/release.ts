import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createRelease, deleteRelease, editRelease } from '../db/release'
import {
  CreateReleaseInput,
  DeleteReleaseInput,
  EditReleaseInput,
} from '../db/release/input'
import { defaultReleaseSelect } from '../db/release/output'
import { requirePermission } from '../guards'
import { prisma } from '../prisma'

export const releaseRouter = createRouter()
  .mutation('add', {
    input: CreateReleaseInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return createRelease(input, account.id)
    },
  })
  .query('all', {
    resolve: async () =>
      prisma.release.findMany({ select: defaultReleaseSelect }),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
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
  .mutation('edit', {
    input: EditReleaseInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return editRelease(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteReleaseInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteRelease(id, account.id)
    },
  })
