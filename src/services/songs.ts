import { trpc } from '../utils/trpc'

export const useSongsQuery = () => trpc.useQuery(['song.all'])

export const useSongQuery = (id: number) => trpc.useQuery(['song.byId', { id }])

export const useAddSongMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['song.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['song.all']),
        utils.setQueryData(['song.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditSongMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['song.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['song.all']),
        utils.setQueryData(['song.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteSongMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['song.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['song.all']),
        utils.invalidateQueries(['song.byId', { id: data.id }]),
      ]),
  })
}
