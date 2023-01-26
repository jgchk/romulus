import { Permission } from '@prisma/client'
import { z } from 'zod'

import {
  createPerson,
  deletePerson,
  editPerson,
  getPeople,
  getPerson,
} from '../db/person'
import { CreatePersonInput, EditPersonInput } from '../db/person/inputs'
import { requirePermission } from '../guards'
import { publicProcedure, router } from '../trpc'

export const personRouter = router({
  add: publicProcedure
    .input(CreatePersonInput)
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return createPerson(input)
    }),
  all: publicProcedure.query(() => getPeople()),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input: { id } }) => getPerson(id)),
  edit: publicProcedure
    .input(EditPersonInput)
    .mutation(async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return editPerson(input)
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_ARTISTS)
      return deletePerson(id)
    }),
})
