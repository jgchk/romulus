import { useAddGenreMutation } from '../../../services/genres'
import GenreForm, { GenreFormData } from './Form'
import { useRouter } from 'next/navigation'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

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
            router.push(`/genres?id=${data.id}`)
          },
        },
      ),
    [mutate, router],
  )

  return (
    <GenreForm
      onSubmit={(data) => handleCreate(data)}
      onClose={() => router.push('/genres')}
      isSubmitting={isLoading}
      isSubmitted={isSuccess}
    />
  )
}

export default GenreCreate
