import { Permission } from '@prisma/client'
import { TRPCClientErrorLike } from '@trpc/client'
import ky from 'ky'
import { useCallback, useMemo } from 'react'
import { useMutation } from 'react-query'

import { DefaultAccount } from '../server/db/account/outputs'
import type { AppRouter } from '../server/routers/_app'
import { trpc } from '../utils/trpc'
import { useAccountQuery } from './accounts'

export const useWhoamiQuery = () => trpc.useQuery(['auth.whoami'])

export const useSession = (): {
  data: DefaultAccount | null | undefined
  error: TRPCClientErrorLike<AppRouter> | null
  isSuccess: boolean
  isLoggedIn: boolean | undefined
  isLoggedOut: boolean | undefined
  hasPermission: (permission: Permission) => boolean | undefined
} => {
  const whoamiQuery = useWhoamiQuery()
  const accountQuery = useAccountQuery(whoamiQuery.data?.id)

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

  if (!whoamiQuery.data) {
    return {
      data: whoamiQuery.data,
      error: whoamiQuery.error,
      isSuccess: whoamiQuery.isSuccess,
      isLoggedIn,
      isLoggedOut,
      hasPermission,
    }
  }

  return {
    data: accountQuery.data,
    error: accountQuery.error,
    isSuccess: accountQuery.isSuccess,
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
