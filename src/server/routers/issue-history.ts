import { z } from 'zod'

import { createRouter } from '../createRouter'
import { CrudOperationInput } from '../db/common/inputs'
import { defaultIssueHistorySelect } from '../db/issue-history/outputs'
import { prisma } from '../prisma'

export const issueHistoryRouter = createRouter()
  .query('byIssueId', {
    input: z.object({
      id: z.number(),
    }),
    resolve: async ({ input: { id } }) =>
      prisma.issueHistory.findMany({
        where: { issueId: id },
        select: defaultIssueHistorySelect,
      }),
  })
  .query('byUserId', {
    input: z.object({
      id: z.number(),
      limit: z.number().min(1).max(100).optional(),
      cursor: z.number().optional(),
    }),
    resolve: async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor, id } = input

      const history = await prisma.issueHistory.findMany({
        where: { accountId: id },
        select: defaultIssueHistorySelect,
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      })

      let nextCursor: typeof cursor | null = null
      if (history.length > limit) {
        const nextItem = history.pop()
        nextCursor = nextItem?.id ?? null
      }

      return {
        history,
        nextCursor,
      }
    },
  })
  .query('byUserId.count', {
    input: z.object({ id: z.number(), operation: CrudOperationInput }),
    resolve: async ({ input: { id, operation } }) => {
      const issues = await prisma.issueHistory.findMany({
        where: { accountId: id, operation },
        select: { issueId: true },
      })

      const ids = new Set(issues.map((issue) => issue.issueId))

      return { count: ids.size }
    },
  })
