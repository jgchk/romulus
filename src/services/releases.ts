import { trpc } from '../utils/trpc'

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
