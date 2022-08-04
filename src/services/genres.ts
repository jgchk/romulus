import { trpc } from '../utils/trpc'

export const useGenresQuery = () => trpc.useQuery(['genre.all'])

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
