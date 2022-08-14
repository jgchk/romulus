import { trpc } from '../utils/trpc'

export const useIssueQuery = (id: number) =>
  trpc.useQuery(['issue.byId', { id }])

export const useAddIssueMutation = () => {
  const utils = trpc.useContext()
  return trpc.useMutation(['issue.add'], {
    onSuccess: (data) => {
      utils.setQueryData(['issue.byId', { id: data.id }], data)
    },
  })
}
