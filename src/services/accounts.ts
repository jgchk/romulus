import { trpc } from '../utils/trpc'
import { useSession } from './auth'

export const useAccountQuery = (id?: number) =>
  trpc.account.byId.useQuery(
    { id: id ?? -1 },
    {
      enabled: id !== undefined,
      staleTime: 60 * 1000,
    }
  )

export const useAccountByUsernameQuery = (username: string) =>
  trpc.account.byUsername.useQuery({ username })

export const useAccountsQuery = () => {
  const utils = trpc.useContext()
  return trpc.account.all.useQuery(undefined, {
    onSuccess: (data) => {
      for (const account of data) {
        utils.account.byId.setData({ id: account.id }, account)
        utils.account.byUsername.setData(
          { username: account.username },
          account
        )
      }
    },
  })
}

export const useEditAccountMutation = () => {
  const utils = trpc.useContext()
  const session = useSession()

  return trpc.account.edit.useMutation({
    onMutate: async (input) => {
      const isMyAccount = session.account && session.account.id === input.id

      await utils.account.byId.cancel({ id: input.id })
      if (isMyAccount) {
        await utils.auth.whoami.cancel()
      }

      let previousData = utils.account.byId.getData({ id: input.id })
      if (!previousData && isMyAccount) {
        previousData = utils.auth.whoami.getData() ?? undefined
      }

      if (previousData) {
        const newData = {
          ...previousData,
          genreRelevanceFilter:
            input.data.genreRelevanceFilter ??
            previousData.genreRelevanceFilter,
          showTypeTags: input.data.showTypeTags ?? previousData.showTypeTags,
          showRelevanceTags:
            input.data.showRelevanceTags ?? previousData.showRelevanceTags,
        }

        utils.account.byId.setData({ id: input.id }, newData)
        if (isMyAccount) {
          utils.auth.whoami.setData(undefined, newData)
        }
      }

      return { previousData }
    },
    onError: async (error, input, context) => {
      const isMyAccount = session.account && session.account.id === input.id

      if (context?.previousData) {
        utils.account.byId.setData({ id: input.id }, context.previousData)
        if (isMyAccount) {
          utils.auth.whoami.setData(undefined, context.previousData)
        }
      } else {
        await utils.account.byId.invalidate({ id: input.id })
        if (isMyAccount) {
          await utils.auth.whoami.invalidate()
        }
      }
    },
    onSettled: async (data, error, input) => {
      const isMyAccount = session.account && session.account.id === input.id

      await utils.account.byId.invalidate({ id: input.id })
      if (isMyAccount) {
        await utils.auth.whoami.invalidate()
      }
    },
  })
}
