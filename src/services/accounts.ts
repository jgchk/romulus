import { trpc } from '../utils/trpc'
import { useSession } from './auth'

export const useAccountQuery = (id?: number) =>
  trpc.useQuery(['account.byId', { id: id ?? -1 }], {
    enabled: id !== undefined,
  })

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
    onMutate: async (input) => {
      const isMyAccount = session.account && session.account.id === input.id

      await utils.cancelQuery(['account.byId', { id: input.id }])
      if (isMyAccount) {
        await utils.cancelQuery(['auth.whoami'])
      }

      let previousData = utils.getQueryData(['account.byId', { id: input.id }])
      if (!previousData && isMyAccount) {
        previousData = utils.getQueryData(['auth.whoami'])
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

        utils.setQueryData(['account.byId', { id: input.id }], newData)
        if (isMyAccount) {
          utils.setQueryData(['auth.whoami'], newData)
        }
      }

      return { previousData }
    },
    onError: async (error, input, context) => {
      const isMyAccount = session.account && session.account.id === input.id

      if (context?.previousData) {
        utils.setQueryData(
          ['account.byId', { id: input.id }],
          context.previousData
        )
        if (isMyAccount) {
          utils.setQueryData(['auth.whoami'], context.previousData)
        }
      } else {
        await utils.invalidateQueries(['account.byId', { id: input.id }])
        if (isMyAccount) {
          await utils.invalidateQueries(['auth.whoami'])
        }
      }
    },
    onSettled: async (data, error, input) => {
      const isMyAccount = session.account && session.account.id === input.id

      await utils.invalidateQueries(['account.byId', { id: input.id }])
      if (isMyAccount) {
        await utils.invalidateQueries(['auth.whoami'])
      }
    },
  })
}
