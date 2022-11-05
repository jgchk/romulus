import { Permission } from '@prisma/client'

import { createRouter } from '../createRouter'
import { createObjectSchema } from '../db/schema'
import { CreateObjectSchemaInput } from '../db/schema/inputs'
import { requirePermission } from '../guards'

export const schemaRouter = createRouter().mutation('add', {
  input: CreateObjectSchemaInput,
  resolve: async ({ input, ctx }) => {
    requirePermission(ctx, Permission.EDIT_RELEASE_TYPES)
    return createObjectSchema(input)
  },
})
