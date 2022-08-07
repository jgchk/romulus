import { useRouter } from 'next/router'
import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useDeleteGenreMutation, useGenreQuery } from '../../services/genres'
import { ButtonPrimary, ButtonTertiary } from '../common/Button'
import GenreViewData from './GenreViewData'

export const GenreDelete: FC<{
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
  const session = useSession()
  const router = useRouter()

  const { mutate: deleteGenre } = useDeleteGenreMutation()
  const handleDelete = useCallback(() => {
    const message = `Deleted genre '${genre.name}'`

    deleteGenre(
      { id: genre.id },
      {
        onSuccess: () => {
          toast.success(message)
          router.push('/genres')
        },
      }
    )
  }, [deleteGenre, genre.id, genre.name, router])

  return (
    <div className='flex flex-col h-full'>
      <GenreViewData genre={genre} />

      {session.isLoggedIn && (
        <div className='border-t'>
          <div className='flex justify-center mt-1 text-gray-800'>
            Are you sure?
          </div>
          <div className='flex p-1 space-x-1'>
            <ButtonPrimary
              className='flex-1 bg-red-600 hover:bg-red-700'
              onClick={() => handleDelete()}
            >
              Delete
            </ButtonPrimary>
            <ButtonTertiary
              className='flex-1'
              onClick={() => router.push(`/genres/${genre.id}`)}
            >
              Cancel
            </ButtonTertiary>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenreDelete
