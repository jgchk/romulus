import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createReleaseType,
  deleteReleaseType,
  editReleaseType,
  getReleaseType,
  getReleaseTypes,
} from '../db/release-type'
import {
  CreateReleaseTypeInput,
  EditReleaseTypeInput,
} from '../db/release-type/inputs'
import { requirePermission } from '../guards'

export const releaseTypeRouter = createRouter()
  .mutation('add', {
    input: CreateReleaseTypeInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return createReleaseType(input)
    },
  })
  .query('all', { resolve: () => getReleaseTypes() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getReleaseType(id),
  })
  .mutation('edit', {
    input: EditReleaseTypeInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return editReleaseType(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return deleteReleaseType(id)
    },
  })
