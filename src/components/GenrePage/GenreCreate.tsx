import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { useAddGenreMutation } from '../../services/genres'
import GenreForm, { GenreFormData } from '../GenreForm'

export const GenreCreate: FC = () => {
  const router = useRouter()

  const { mutate } = useAddGenreMutation()
  const handleCreate = useCallback(
    (data: GenreFormData) =>
      mutate(
        {
          ...data,
          shortDescription: data.shortDescription ?? undefined,
          longDescription: data.longDescription ?? undefined,
          notes: data.notes ?? undefined,
        },
        {
          onSuccess: (data) => {
            toast.success(`Created genre '${data.name}'`)
            router.push({
              pathname: '/genres/[id]',
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
      onClose={() => router.push({ pathname: '/genres' })}
    />
  )
}

export default GenreCreate
