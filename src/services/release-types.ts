import { trpc } from '../utils/trpc'

export const useReleaseTypesQuery = () => trpc.useQuery(['release.type.all'])

export const useReleaseTypeQuery = (id: number) =>
  trpc.useQuery(['release.type.byId', { id }])

export const useAddReleaseTypeMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['release.type.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['release.type.all']),
        utils.setQueryData(['release.type.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteReleaseTypeMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['release.type.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['release.type.all']),
        utils.invalidateQueries(['release.type.byId', { id: data.id }]),
      ]),
  })
}
