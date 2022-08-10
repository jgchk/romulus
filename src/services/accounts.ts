import { trpc } from '../utils/trpc'

export const useAccountQuery = (id: number) =>
  trpc.useQuery(['account.byId', { id }])
