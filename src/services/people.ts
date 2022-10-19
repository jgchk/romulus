import { trpc } from '../utils/trpc'

export const usePeopleQuery = () => trpc.useQuery(['person.all'])

export const usePersonQuery = (id: number) =>
  trpc.useQuery(['person.byId', { id }])

export const useAddPersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['person.add'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['person.all']),
        utils.setQueryData(['person.byId', { id: data.id }], data),
      ]),
  })
}

export const useEditPersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['person.edit'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['person.all']),
        utils.setQueryData(['person.byId', { id: data.id }], data),
      ]),
  })
}

export const useDeletePersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['person.delete'], {
    onSuccess: (data) =>
      Promise.all([
        utils.invalidateQueries(['person.all']),
        utils.invalidateQueries(['person.byId', { id: data.id }]),
      ]),
  })
}
