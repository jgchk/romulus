import { trpc } from '../utils/trpc'

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
