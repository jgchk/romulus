import { CrudOperation } from '@prisma/client'

import { trpc } from '../utils/trpc'

export const useGenreHistoryQuery = (id: number) =>
  trpc.useQuery(['genre.history.byGenreId', { id }])

export const useGenreHistoryByUserQuery = (id: number) =>
  trpc.useInfiniteQuery(['genre.history.byUserId', { id, limit: 10 }], {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

export const useGenreHistoryCountByUserQuery = (
  id: number,
  operation: CrudOperation
) => trpc.useQuery(['genre.history.byUserId.count', { id, operation }])

export const useGiveCreateCreditMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.history.giveCreateCredit'], {
    onSuccess: async (data, { genreId }) => {
      await Promise.all([
        utils.invalidateQueries(['genre.history.byGenreId', { id: genreId }]),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}
