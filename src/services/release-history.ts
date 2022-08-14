import { CrudOperation } from '@prisma/client'

import { trpc } from '../utils/trpc'

export const useReleaseHistoryQuery = (id: number) =>
  trpc.useQuery(['release.history.byReleaseId', { id }])

export const useReleaseHistoryByUserQuery = (id: number) =>
  trpc.useInfiniteQuery(['release.history.byUserId', { id, limit: 10 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const useReleaseHistoryCountByUserQuery = (
  id: number,
  operation: CrudOperation
) => trpc.useQuery(['release.history.byUserId.count', { id, operation }])
