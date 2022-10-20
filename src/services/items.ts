import { trpc } from '../utils/trpc'

export const useItemsQuery = () => trpc.useQuery(['item.all'])

export const useItemQuery = (id: number) => trpc.useQuery(['item.byId', { id }])

export const useAddItemMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['item.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['item.all']),
        utils.setQueryData(['item.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditItemMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['item.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['item.all']),
        utils.setQueryData(['item.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteItemMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['item.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['item.all']),
        utils.invalidateQueries(['item.byId', { id: data.id }]),
      ]),
  })
}
