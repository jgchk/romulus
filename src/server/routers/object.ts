import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createObject,
  deleteObject,
  editObject,
  getObject,
  getObjects,
} from '../db/object'
import {
  CreateObjectInput,
  DeleteObjectInput,
  EditObjectInput,
} from '../db/object/input'
import { requirePermission } from '../guards'

export const objectRouter = createRouter()
  .mutation('add', {
    input: CreateObjectInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return createObject(input, account.id)
    },
  })
  .query('all', {
    resolve: () => getObjects(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
      const object = await getObject(id)

      if (!object) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No object with id '${id}'`,
        })
      }

      return object
    },
  })
  .mutation('edit', {
    input: EditObjectInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return editObject(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteObjectInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteObject(id, account.id)
    },
  })
