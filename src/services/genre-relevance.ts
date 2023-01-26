import { trpc } from '../utils/trpc'

export const useGenreRelevanceVotesQuery = (genreId: number) =>
  trpc.genre.relevance.byGenreId.useQuery({ id: genreId })

export const useGenreRelevanceVoteQuery = (genreId: number) =>
  trpc.genre.relevance.byGenreIdForAccount.useQuery({ id: genreId })

export const useGenreRelevanceVoteMutation = () => {
  const utils = trpc.useContext()
  return trpc.genre.relevance.vote.useMutation({
    onSuccess: async (data, { genreId }) => {
      utils.genre.relevance.byGenreIdForAccount.setData({ id: genreId }, data)
      await Promise.all([
        utils.genre.paginated.invalidate(),
        utils.genre.tree.topLevel.invalidate(),
        utils.genre.searchSimple.invalidate(),
        utils.genre.relevance.byGenreId.invalidate({ id: genreId }),
        utils.genre.byId.invalidate({ id: genreId }),
        utils.genre.byIdSimple.invalidate({ id: genreId }),
      ])
    },
  })
}

export const useDeleteGenreRelevanceVoteMutation = () => {
  const utils = trpc.useContext()
  return trpc.genre.relevance.delete.useMutation({
    onSuccess: async (data, { genreId }) => {
      utils.genre.relevance.byGenreIdForAccount.setData({ id: genreId }, null)
      await Promise.all([
        utils.genre.paginated.invalidate(),
        utils.genre.tree.topLevel.invalidate(),
        utils.genre.searchSimple.invalidate(),
        utils.genre.relevance.byGenreId.invalidate({ id: genreId }),
        utils.genre.byId.invalidate({ id: genreId }),
        utils.genre.byIdSimple.invalidate({ id: genreId }),
      ])
    },
  })
}
