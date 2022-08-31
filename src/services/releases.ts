import { trpc } from '../utils/trpc'

export const useReleasesQuery = () => trpc.useQuery(['release.all'])

export const useReleaseQuery = (id: number) =>
  trpc.useQuery(['release.byId', { id }])

export const useAddReleaseMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['release.add'], {
    onSuccess: (data) => {
      utils.setQueryData(['release.byId', { id: data.id }], data)
    },
  })
}

export const useDeleteReleaseMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['release.delete'], {
    onSuccess: async (data, { id }) => {
      await Promise.all([
        utils.invalidateQueries(['release.all']),
        utils.invalidateQueries(['release.byId', { id }]),
        utils.invalidateQueries(['release.history.byReleaseId', { id }]),
      ])
    },
  })
}
