import { trpc } from '../utils/trpc'

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
  return trpc.useMutation(['account.edit'], {
    onMutate: async (input) => {
      await utils.cancelQuery(['account.byId', { id: input.id }])

      const previousData = utils.getQueryData([
        'account.byId',
        { id: input.id },
      ])

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
      }

      return { previousData }
    },
    onError: async (error, input, context) => {
      if (context?.previousData) {
        utils.setQueryData(
          ['account.byId', { id: input.id }],
          context.previousData
        )
      } else {
        await utils.invalidateQueries(['account.byId', { id: input.id }])
      }
    },
    onSettled: async (data, error, input) => {
      await utils.invalidateQueries(['account.byId', { id: input.id }])
    },
  })
}
