import { Permission } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { createRouter } from '../createRouter'
import {
  createIssue,
  deleteIssue,
  editIssue,
  getIssue,
  getIssues,
} from '../db/issue'
import {
  CreateIssueInput,
  DeleteIssueInput,
  EditIssueInput,
} from '../db/issue/input'
import { requirePermission } from '../guards'

export const issueRouter = createRouter()
  .mutation('add', {
    input: CreateIssueInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return createIssue(input, account.id)
    },
  })
  .query('all', {
    resolve: () => getIssues(),
  })
  .query('byId', {
    input: z.object({ id: z.number() }),
    resolve: async ({ input: { id } }) => {
      const issue = await getIssue(id)

      if (!issue) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No issue with id '${id}'`,
        })
      }

      return issue
    },
  })
  .mutation('edit', {
    input: EditIssueInput,
    resolve: ({ input, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return editIssue(input, account.id)
    },
  })
  .mutation('delete', {
    input: DeleteIssueInput,
    resolve: async ({ input: { id }, ctx }) => {
      const { account } = requirePermission(ctx, Permission.EDIT_RELEASES)
      return deleteIssue(id, account.id)
    },
  })
