import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useEditAccountMutation } from '../../../services/accounts'
import { useSession } from '../../../services/auth'

export const useGenreNavigatorSettings = () => {
  const session = useSession()

  const { mutate: editAccount } = useEditAccountMutation()

  const genreRelevanceFilter = useMemo(
    () => session.account?.genreRelevanceFilter ?? 1,
    [session.account?.genreRelevanceFilter]
  )
  const setGenreRelevanceFilter = useCallback(
    (value: number) => {
      const accountId = session.account?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { genreRelevanceFilter: value },
      })
    },
    [editAccount, session.account?.id]
  )

  const showTypeTags = useMemo(
    () => session.account?.showTypeTags ?? true,
    [session.account?.showTypeTags]
  )
  const setShowTypeTags = useCallback(
    (value: boolean) => {
      const accountId = session.account?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { showTypeTags: value },
      })
    },
    [editAccount, session.account?.id]
  )

  const showRelevanceTags = useMemo(
    () => session.account?.showRelevanceTags ?? false,
    [session.account?.showRelevanceTags]
  )
  const setShowRelevanceTags = useCallback(
    (value: boolean) => {
      const accountId = session.account?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { showRelevanceTags: value },
      })
    },
    [editAccount, session.account?.id]
  )

  const data = useMemo(
    () => ({
      showTypeTags,
      setShowTypeTags,
      genreRelevanceFilter,
      setGenreRelevanceFilter,
      showRelevanceTags,
      setShowRelevanceTags,
    }),
    [
      genreRelevanceFilter,
      setGenreRelevanceFilter,
      setShowRelevanceTags,
      setShowTypeTags,
      showRelevanceTags,
      showTypeTags,
    ]
  )

  return data
}

export default useGenreNavigatorSettings
