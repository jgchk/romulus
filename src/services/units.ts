import { trpc } from '../utils/trpc'

export const useUnitsQuery = () => trpc.useQuery(['unit.all'])

export const useUnitQuery = (id: number) => trpc.useQuery(['unit.byId', { id }])

export const useAddUnitMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['unit.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['unit.all']),
        utils.setQueryData(['unit.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditUnitMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['unit.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['unit.all']),
        utils.setQueryData(['unit.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteUnitMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['unit.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['unit.all']),
        utils.invalidateQueries(['unit.byId', { id: data.id }]),
      ]),
  })
}
