import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createSense, getSense, getSenses } from '../db/sense'
import { CreateSenseInput } from '../db/sense/inputs'
import { requirePermission } from '../guards'

export const senseRouter = createRouter()
  .mutation('add', {
    input: CreateSenseInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return createSense(input)
    },
  })
  .query('all', { resolve: () => getSenses() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getSense(id),
  })
