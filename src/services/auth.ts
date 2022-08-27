import { Permission } from '@prisma/client'
import ky from 'ky'
import { useCallback, useMemo } from 'react'
import { useMutation } from 'react-query'

import { trpc } from '../utils/trpc'

export const useWhoamiQuery = () => trpc.useQuery(['auth.whoami'])

export const useSession = () => {
  const whoamiQuery = useWhoamiQuery()

  const isLoggedIn = useMemo(() => {
    if (!whoamiQuery.isSuccess) return undefined
    return whoamiQuery.data !== null
  }, [whoamiQuery.data, whoamiQuery.isSuccess])

  const isLoggedOut = useMemo(() => {
    if (!whoamiQuery.isSuccess) return undefined
    return whoamiQuery.data === null
  }, [whoamiQuery.data, whoamiQuery.isSuccess])

  const hasPermission = useCallback(
    (permission: Permission) =>
      whoamiQuery.data?.permissions.includes(permission),
    [whoamiQuery.data?.permissions]
  )

  return {
    account: whoamiQuery.data,
    error: whoamiQuery.error,
    isLoggedIn,
    isLoggedOut,
    hasPermission,
  }
}

export const useLoginMutation = () => {
  const utils = trpc.useContext()
  return useMutation(
    ({ username, password }: { username: string; password: string }) =>
      ky.post('/api/login', { json: { username, password } }),
    {
      onSuccess: async () => {
        await utils.invalidateQueries(['auth.whoami'])
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
      onSuccess: async () => {
        await utils.invalidateQueries(['auth.whoami'])
      },
    }
  )
}

export const useLogoutMutation = () => {
  const utils = trpc.useContext()
  return useMutation(() => ky.post('/api/logout'), {
    onSuccess: async () => {
      await utils.invalidateQueries(['auth.whoami'])
    },
  })
}
