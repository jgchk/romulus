import { trpc } from '../utils/trpc'

export const useGenreRelevanceVotesQuery = (genreId: number) =>
  trpc.useQuery(['genre.relevance.byGenreId', { id: genreId }])

export const useGenreRelevanceVoteQuery = (genreId: number) =>
  trpc.useQuery(['genre.relevance.byGenreIdForAccount', { id: genreId }])

export const useGenreRelevanceVoteMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation('genre.relevance.vote', {
    onSuccess: async (data, { genreId }) => {
      utils.setQueryData(
        ['genre.relevance.byGenreIdForAccount', { id: genreId }],
        data
      )
      await Promise.all([
        utils.invalidateQueries(['genre.relevance.byGenreId', { id: genreId }]),
        utils.invalidateQueries(['genre.byId', { id: genreId }]),
        utils.invalidateQueries(['genre.byId.simple', { id: genreId }]),
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.tree']),
      ])
    },
  })
}

export const useDeleteGenreRelevanceVoteMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation('genre.relevance.delete', {
    onSuccess: async (data, { genreId }) => {
      utils.setQueryData(
        ['genre.relevance.byGenreIdForAccount', { id: genreId }],
        null
      )
      await Promise.all([
        utils.invalidateQueries(['genre.relevance.byGenreId', { id: genreId }]),
        utils.invalidateQueries(['genre.byId', { id: genreId }]),
        utils.invalidateQueries(['genre.byId.simple', { id: genreId }]),
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.tree']),
      ])
    },
  })
}
