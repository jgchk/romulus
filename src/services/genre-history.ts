import { CrudOperation } from '@prisma/client'

import { trpc } from '../utils/trpc'

export const useGenreHistoryQuery = (id: number) =>
  trpc.genre.history.byGenreId.useQuery({ id })

export const useGenreHistoryByUserQuery = (id: number) =>
  trpc.genre.history.byUserId.useInfiniteQuery(
    { id, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

export const useGenreHistoryCountByUserQuery = (
  id: number,
  operation: CrudOperation
) => trpc.genre.history.userCount.useQuery({ id, operation })
