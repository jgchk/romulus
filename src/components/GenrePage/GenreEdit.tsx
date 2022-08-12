import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../server/db/genre/outputs'
import { useEditGenreMutation, useGenreQuery } from '../../services/genres'
import { CenteredLoader } from '../common/Loader'
import GenreForm, { GenreFormData, GenreFormFields } from './GenreForm'

export const GenreEdit: FC<{
  id: number
  autoFocus?: keyof GenreFormFields
}> = ({ id, autoFocus }) => {
  const genreQuery = useGenreQuery(id)

  if (genreQuery.data) {
    return <HasData genre={genreQuery.data} autoFocus={autoFocus} />
  }

  if (genreQuery.error) {
    return <div>Error fetching genre :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{
  genre: DefaultGenre
  autoFocus?: keyof GenreFormFields
}> = ({ genre, autoFocus }) => {
  const router = useRouter()

  const { mutate: editGenre, isLoading, isSuccess } = useEditGenreMutation()
  const handleEdit = useCallback(
    (data: GenreFormData) =>
      editGenre(
        { id: genre.id, data },
        {
          onSuccess: async (data) => {
            toast.success(`Updated genre '${data.name}'`)
            await router.push({
              pathname: '/genres/[id]',
              query: { id: data.id.toString() },
            })
          },
        }
      ),
    [editGenre, genre.id, router]
  )

  return (
    <GenreForm
      autoFocus={autoFocus}
      genre={genre}
      onSubmit={(data) => handleEdit(data)}
      onClose={() =>
        void router.push({
          pathname: '/genres/[id]',
          query: { id: genre.id.toString() },
        })
      }
      isSubmitting={isLoading}
      isSubmitted={isSuccess}
    />
  )
}

export default GenreEdit
