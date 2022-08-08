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

export const useGenreQuery = (id: number) =>
  trpc.useQuery(['genre.byId', { id }])

export const useAddGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.add'], {
    onSuccess: () => {
      utils.invalidateQueries(['genre.all'])
    },
  })
}

export const useEditGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.edit'], {
    onSuccess: (data) => {
      utils.invalidateQueries(['genre.all'])
      utils.setQueryData(['genre.byId', { id: data.id }], data)
    },
  })
}

export const useDeleteGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.delete'], {
    onSuccess: (data, { id }) => {
      utils.invalidateQueries(['genre.all'])
      utils.invalidateQueries(['genre.byId', { id }])
    },
  })
}
