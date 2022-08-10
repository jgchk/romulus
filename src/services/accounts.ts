import { trpc } from '../utils/trpc'
import { useSession } from './auth'

export const useAccountQuery = (id: number) => {
  const utils = trpc.useContext()
  const session = useSession()
  return trpc.useQuery(['account.byId', { id }], {
    onSuccess: (data) => {
      const id = session.data?.id
      if (id === data.id) {
        utils.setQueryData(['auth.whoami'], data)
      }
    },
  })
}
