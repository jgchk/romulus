import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

import useLocalStorage from '../../hooks/useLocalStorage'
import { useEditAccountMutation } from '../../services/accounts'
import { useSession } from '../../services/auth'

export const useGenreTreeSettings = () => {
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
        toast.error('You must be logged in to edit your account')
        return
      }

      return editAccount({
        id: accountId,
        data: { genreRelevanceFilter: value },
      })
    },
    [editAccount, session.data?.id]
  )

  const [showTypeTags, setShowTypeTags] = useLocalStorage(
    'settings.genreTree.showTypeTags',
    true
  )

  const [showRelevanceTags, setShowRelevanceTags] = useLocalStorage(
    'settings.genreTree.showRelevanceTags',
    false
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

export default useGenreTreeSettings
