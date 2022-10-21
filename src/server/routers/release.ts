import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createRelease,
  deleteRelease,
  editRelease,
  getRelease,
  getReleases,
} from '../db/release'
import { CreateReleaseInput, EditReleaseInput } from '../db/release/inputs'
import { requirePermission } from '../guards'

export const releaseRouter = createRouter()
  .mutation('add', {
    input: CreateReleaseInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return createRelease(input)
    },
  })
  .query('all', { resolve: () => getReleases() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getRelease(id),
  })
  .mutation('edit', {
    input: EditReleaseInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return editRelease(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteRelease(id)
    },
  })
