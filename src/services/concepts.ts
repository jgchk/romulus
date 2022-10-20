import { trpc } from '../utils/trpc'

export const useConceptsQuery = () => trpc.useQuery(['concept.all'])

export const useConceptQuery = (id: number) =>
  trpc.useQuery(['concept.byId', { id }])

export const useAddConceptMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['concept.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['concept.all']),
        utils.setQueryData(['concept.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditConceptMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['concept.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['concept.all']),
        utils.setQueryData(['concept.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeleteConceptMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['concept.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['concept.all']),
        utils.invalidateQueries(['concept.byId', { id: data.id }]),
      ]),
  })
}
