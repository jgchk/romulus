import ky from 'ky'
import { useMemo } from 'react'
import { useMutation } from 'react-query'
import { trpc } from '../utils/trpc'

export const useSession = () => {
  const whoamiQuery = trpc.useQuery(['auth.whoami'])

  const isLoggedIn = useMemo(() => {
    if (!whoamiQuery.isSuccess) return undefined
    return whoamiQuery.data !== null
  }, [whoamiQuery.data, whoamiQuery.isSuccess])

  const isLoggedOut = useMemo(() => {
    if (!whoamiQuery.isSuccess) return undefined
    return whoamiQuery.data === null
  }, [whoamiQuery.data, whoamiQuery.isSuccess])

  return { ...whoamiQuery, isLoggedIn, isLoggedOut }
}

export const useLoginMutation = () => {
  const utils = trpc.useContext()
  return useMutation(
    ({ username, password }: { username: string; password: string }) =>
      ky.post('/api/login', { json: { username, password } }),
    {
      onSuccess: () => {
        utils.invalidateQueries(['auth.whoami'])
      },
    }
  )
}

export const useRegisterMutation = () => {
  const utils = trpc.useContext()
  return useMutation(
    ({ username, password }: { username: string; password: string }) =>
      ky.post('/api/register', { json: { username, password } }),
    {
      onSuccess: () => {
        utils.invalidateQueries(['auth.whoami'])
      },
    }
  )
}
