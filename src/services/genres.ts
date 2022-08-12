import { trpc } from '../utils/trpc'

export const useGenresQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['genre.all'], {
    onSuccess: (data) => {
      for (const genre of data) {
        utils.setQueryData(['genre.byId', { id: genre.id }], genre)
      }
    },
  })
}

export const useSimpleGenresQuery = () => trpc.useQuery(['genre.all.simple'])
export const useTreeGenresQuery = () => trpc.useQuery(['genre.all.tree'])

export const useGenreQuery = (id: number) =>
  trpc.useQuery(['genre.byId', { id }])

export const useAddGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.add'], {
    onSuccess: async () => {
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId']),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}

export const useEditGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.edit'], {
    onSuccess: async (data) => {
      utils.setQueryData(['genre.byId', { id: data.id }], data)
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId']),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}

export const useDeleteGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.delete'], {
    onSuccess: async () => {
      await Promise.all([
        utils.invalidateQueries(['genre.all']),
        utils.invalidateQueries(['genre.all.simple']),
        utils.invalidateQueries(['genre.all.tree']),
        utils.invalidateQueries(['genre.history.byGenreId']),
        utils.invalidateQueries(['genre.history.byUserId']),
        utils.invalidateQueries(['genre.history.byUserId.count']),
      ])
    },
  })
}
