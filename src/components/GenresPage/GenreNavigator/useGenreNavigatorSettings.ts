import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useEditAccountMutation } from '../../../services/accounts'
import { useSession } from '../../../services/auth'

export const useGenreNavigatorSettings = () => {
  const session = useSession()

  const { mutate: editAccount } = useEditAccountMutation()

  const genreRelevanceFilter = useMemo(
    () => session.data?.genreRelevanceFilter ?? 1,
    [session.data?.genreRelevanceFilter]
  )
  const setGenreRelevanceFilter = useCallback(
    (value: number) => {
      const accountId = session.data?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { genreRelevanceFilter: value },
      })
    },
    [editAccount, session.data?.id]
  )

  const showTypeTags = useMemo(
    () => session.data?.showTypeTags ?? true,
    [session.data?.showTypeTags]
  )
  const setShowTypeTags = useCallback(
    (value: boolean) => {
      const accountId = session.data?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { showTypeTags: value },
      })
    },
    [editAccount, session.data?.id]
  )

  const showRelevanceTags = useMemo(
    () => session.data?.showRelevanceTags ?? false,
    [session.data?.showRelevanceTags]
  )
  const setShowRelevanceTags = useCallback(
    (value: boolean) => {
      const accountId = session.data?.id
      if (accountId === undefined) {
        toast.error('You must be logged in to update this setting')
        return
      }

      return editAccount({
        id: accountId,
        data: { showRelevanceTags: value },
      })
    },
    [editAccount, session.data?.id]
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
