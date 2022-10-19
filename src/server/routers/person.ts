import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createPerson,
  deletePerson,
  editPerson,
  getPeople,
  getPerson,
} from '../db/person'
import { CreatePersonInput, EditPersonInput } from '../db/person/inputs'
import { requirePermission } from '../guards'

export const personRouter = createRouter()
  .mutation('add', {
    input: CreatePersonInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return createPerson(input)
    },
  })
  .query('all', {
    resolve: () => getPeople(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getPerson(id),
  })
  .mutation('edit', {
    input: EditPersonInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return editPerson(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return deletePerson(id)
    },
  })
