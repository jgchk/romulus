import { trpc } from '../utils/trpc'

export const useGenresQuery = () => trpc.useQuery(['genre.all'])

export const useAddGenreMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['genre.add'], {
    onSuccess: () => {
      utils.invalidateQueries(['genre.all'])
    },
  })
}
