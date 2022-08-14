import { Permission } from '@prisma/client'
import ky from 'ky'
import { useCallback, useMemo } from 'react'
import { useMutation } from 'react-query'

import { trpc } from '../utils/trpc'
import { useAccountQuery } from './accounts'

export const useWhoamiQuery = () => trpc.useQuery(['auth.whoami'])

export const useSession = () => {
  const whoamiQueryy = useWhoamiQuery()
  const accountQuery = useAccountQuery(whoamiQueryy.data?.id)

  const isLoggedIn = useMemo(() => {
    if (!accountQuery.isSuccess) return undefined
    return accountQuery.data !== null
  }, [accountQuery.data, accountQuery.isSuccess])

  const isLoggedOut = useMemo(() => {
    if (!accountQuery.isSuccess) return undefined
    return accountQuery.data === null
  }, [accountQuery.data, accountQuery.isSuccess])

  const hasPermission = useCallback(
    (permission: Permission) =>
      accountQuery.data?.permissions.includes(permission),
    [accountQuery.data?.permissions]
  )

  return { ...accountQuery, isLoggedIn, isLoggedOut, hasPermission }
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
