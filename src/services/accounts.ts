import { trpc } from '../utils/trpc'
import { useSession } from './auth'

export const useAccountQuery = (id: number) =>
  trpc.useQuery(['account.byId', { id }])

export const useAccountsQuery = () => {
  const utils = trpc.useContext()
  return trpc.useQuery(['account.all'], {
    onSuccess: (data) => {
      for (const account of data) {
        utils.setQueryData(['account.byId', { id: account.id }], account)
      }
    },
  })
}

export const useEditAccountMutation = () => {
  const utils = trpc.useContext()
  const session = useSession()
  return trpc.useMutation(['account.edit'], {
    onSuccess: async (data) => {
      utils.setQueryData(['account.byId', { id: data.id }], data)

      const accountId = session.data?.id
      if (accountId === undefined) {
        await utils.invalidateQueries(['auth.whoami'])
      } else if (data.id === accountId) {
        utils.setQueryData(['auth.whoami'], data)
      }
    },
  })
}
