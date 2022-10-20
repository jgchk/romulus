import { Permission } from '@prisma/client'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import { createItem, deleteItem, editItem, getItem, getItems } from '../db/item'
import { CreateItemInput, EditItemInput } from '../db/item/inputs'
import { requirePermission } from '../guards'

export const itemRouter = createRouter()
  .mutation('add', {
    input: CreateItemInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return createItem(input)
    },
  })
  .query('all', { resolve: () => getItems() })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: ({ input: { id } }) => getItem(id),
  })
  .mutation('edit', {
    input: EditItemInput,
    resolve: async ({ input, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return editItem(input)
    },
  })
  .mutation('delete', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id }, ctx }) => {
      requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteItem(id)
    },
  })
