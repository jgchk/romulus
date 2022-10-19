import { trpc } from '../utils/trpc'

export const useArtistsQuery = () => trpc.useQuery(['artist.all'])

export const useArtistQuery = (id: number) =>
  trpc.useQuery(['artist.byId', { id }])

export const useAddArtistMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['artist.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['artist.all']),
        utils.setQueryData(['artist.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditArtistMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['artist.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['artist.all']),
        utils.setQueryData(['artist.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteArtistMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['artist.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['artist.all']),
        utils.invalidateQueries(['artist.byId', { id: data.id }]),
      ]),
  })
}
