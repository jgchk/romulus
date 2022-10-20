import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createConcept,
  deleteConcept,
  editConcept,
  getConcept,
  getConcepts,
} from '../db/concept'
import { CreateConceptInput, EditConceptInput } from '../db/concept/inputs'
import { requirePermission } from '../guards'

export const conceptRouter = createRouter()
  .mutation('add', {
    input: CreateConceptInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return createConcept(input)
    },
  })
  .query('all', { resolve: () => getConcepts() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getConcept(id),
  })
  .mutation('edit', {
    input: EditConceptInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return editConcept(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteConcept(id)
    },
  })
