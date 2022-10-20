import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createUnit, deleteUnit, editUnit, getUnit, getUnits } from '../db/unit'
import { CreateUnitInput, EditUnitInput } from '../db/unit/inputs'
import { requirePermission } from '../guards'

export const unitRouter = createRouter()
  .mutation('add', {
    input: CreateUnitInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return createUnit(input)
    },
  })
  .query('all', { resolve: () => getUnits() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getUnit(id),
  })
  .mutation('edit', {
    input: EditUnitInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return editUnit(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteUnit(id)
    },
  })
