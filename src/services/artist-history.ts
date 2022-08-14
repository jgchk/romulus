import { CrudOperation } from '@prisma/client'

import { trpc } from '../utils/trpc'

export const useArtistHistoryQuery = (id: number) =>
  trpc.useQuery(['artist.history.byArtistId', { id }])

export const useArtistHistoryByUserQuery = (id: number) =>
  trpc.useInfiniteQuery(['artist.history.byUserId', { id, limit: 10 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const useArtistHistoryCountByUserQuery = (
  id: number,
  operation: CrudOperation
) => trpc.useQuery(['artist.history.byUserId.count', { id, operation }])
