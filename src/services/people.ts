import { trpc } from '../utils/trpc'

export const usePeopleQuery = () => trpc.person.all.useQuery()

export const usePersonQuery = (id: number) => trpc.person.byId.useQuery({ id })

export const useAddPersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.person.add.useMutation({
    onSuccess: (data) =>
      Promise.all([
        utils.person.all.invalidate(),
        utils.person.byId.setData({ id: data.id }, data),
      ]),
  })
}

export const useEditPersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.person.edit.useMutation({
    onSuccess: (data) =>
      Promise.all([
        utils.person.all.invalidate(),
        utils.person.byId.setData({ id: data.id }, data),
      ]),
  })
}

export const useDeletePersonMutation = () => {
  const utils = trpc.useContext()
  return trpc.person.delete.useMutation({
    onSuccess: (data) =>
      Promise.all([
        utils.person.all.invalidate(),
        utils.person.byId.invalidate({ id: data.id }),
      ]),
  })
}
