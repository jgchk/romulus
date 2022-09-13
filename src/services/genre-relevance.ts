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
        utils.invalidateQueries(['genre.all.simple']),
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
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
      ])
    },
  })
}

/*
 * WHERE WE LEFT OFF:
 *   We have voting mostly implemented. Really the last steps are:
 *
 *   1. Add interface to view votes (your own and others)
 *   2. Push to server and run manual migration
 *   3. Remove relevance from history
 */
