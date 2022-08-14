import { CrudOperation } from '@prisma/client'

import { trpc } from '../utils/trpc'

export const useIssueHistoryQuery = (id: number) =>
  trpc.useQuery(['issue.history.byIssueId', { id }])

export const useIssueHistoryByUserQuery = (id: number) =>
  trpc.useInfiniteQuery(['issue.history.byUserId', { id, limit: 10 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const useIssueHistoryCountByUserQuery = (
  id: number,
  operation: CrudOperation
) => trpc.useQuery(['issue.history.byUserId.count', { id, operation }])
