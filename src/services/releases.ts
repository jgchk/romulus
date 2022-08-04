import { trpc } from '../utils/trpc'

export const useReleasesQuery = () => trpc.useQuery(['release.all'])

export const useReleaseQuery = (id: number) =>
  trpc.useQuery(['release.byId', { id }])

export const useAddReleaseMutation = () => trpc.useMutation('release.add')
