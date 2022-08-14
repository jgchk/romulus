import { trpc } from '../utils/trpc'

export const useArtistQuery = (id: number) =>
  trpc.useQuery(['artist.byId', { id }])

export const useSimpleArtistsQuery = () => trpc.useQuery(['artist.all.simple'])

export const useAddArtistMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['artist.add'], {
    onSuccess: (data) => {
      utils.setQueryData(['artist.byId', { id: data.id }], data)
    },
  })
}
