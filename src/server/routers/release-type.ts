import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createReleaseType,
  deleteReleaseType,
  getReleaseType,
  getReleaseTypes,
} from '../db/release-type'
import { CreateReleaseTypeInput } from '../db/release-type/inputs'
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
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
      return deleteReleaseType(id)
    },
  })
  .query('fieldTypes', {
    resolve: async () => {
      const releaseTypes = await getReleaseTypes()
      return [
        { id: 0, name: 'String' },
        { id: 1, name: 'Integer' },
        { id: 2, name: 'Decimal' },
        { id: 3, name: 'Artist' },
        ...releaseTypes.map((rt) => ({
          id: rt.id,
          name: rt.schemaObject.name,
        })),
      ]
    },
  })
