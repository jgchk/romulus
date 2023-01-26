import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { useAddGenreMutation } from '../../../services/genres'
import GenreForm, { GenreFormData } from './Form'

export const GenreCreate: FC = () => {
  const router = useRouter()

  const { mutate, isLoading, isSuccess } = useAddGenreMutation()
  const handleCreate = useCallback(
    (data: GenreFormData) =>
      mutate(
        {
          ...data,
          subtitle: data.subtitle ?? undefined,
          shortDescription: data.shortDescription ?? undefined,
          longDescription: data.longDescription ?? undefined,
          notes: data.notes ?? undefined,
        },
        {
          onSuccess: (data) => {
            toast.success(`Created genre '${data.name}'`)
            void router.push({
              pathname: '/genres',
              query: { id: data.id.toString() },
            })
          },
        }
      ),
    [mutate, router]
  )

  return (
    <GenreForm
      onSubmit={(data) => handleCreate(data)}
      onClose={() => void router.push({ pathname: '/genres' })}
      isSubmitting={isLoading}
      isSubmitted={isSuccess}
    />
  )
}

export default GenreCreate
