import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../server/db/genre'
import { useEditGenreMutation, useGenreQuery } from '../../services/genres'
import GenreForm, { GenreFormData } from '../GenreForm'

export const GenreEdit: FC<{
  id: number
}> = ({ id }) => {
  const genreQuery = useGenreQuery(id)

  if (genreQuery.data) {
    return <HasData genre={genreQuery.data} />
  }

  if (genreQuery.error) {
    return <div>Error fetching genre :(</div>
  }

  return <div>Loading...</div>
}

const HasData: FC<{ genre: DefaultGenre }> = ({ genre }) => {
  const router = useRouter()

  const { mutate: editGenre } = useEditGenreMutation()
  const handleEdit = useCallback(
    (data: GenreFormData) =>
      editGenre(
        { id: genre.id, data },
        {
          onSuccess: (data) => {
            toast.success(`Updated genre '${data.name}'`)
            router.push(`/genres/${data.id}`)
          },
        }
      ),
    [editGenre, genre.id, router]
  )

  return (
    <GenreForm
      genre={genre}
      onSubmit={(data) => handleEdit(data)}
      onClose={() => router.push(`/genres/${genre.id}`)}
    />
  )
}

export default GenreEdit
