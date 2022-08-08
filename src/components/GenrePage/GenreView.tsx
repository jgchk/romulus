import { useRouter } from 'next/router'
import { FC, useCallback, useState } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../server/db/genre'
import { useSession } from '../../services/auth'
import { useDeleteGenreMutation, useGenreQuery } from '../../services/genres'
import {
  ButtonPrimary,
  ButtonPrimaryRed,
  ButtonTertiary,
} from '../common/Button'
import Loader, { CenteredLoader } from '../common/Loader'
import GenreViewData from './GenreViewData'

export const GenreView: FC<{
  id: number
}> = ({ id }) => {
  const genreQuery = useGenreQuery(id)

  if (genreQuery.data) {
    return <HasData genre={genreQuery.data} />
  }

  if (genreQuery.error) {
    return <div>Error fetching genre :(</div>
  }

  return <CenteredLoader />
}

const HasData: FC<{ genre: DefaultGenre }> = ({ genre }) => {
  const session = useSession()
  const router = useRouter()

  const [confirmDelete, setConfirmDelete] = useState(false)

  const { mutate: deleteGenre, isLoading: isDeleting } =
    useDeleteGenreMutation()
  const handleDelete = useCallback(
    () =>
      deleteGenre(
        { id: genre.id },
        {
          onSuccess: () => {
            toast.success(`Deleted genre '${genre.name}'`)
            router.push({ pathname: '/genres' })
          },
        }
      ),
    [deleteGenre, genre.id, genre.name, router]
  )

  return (
    <div className='flex flex-col h-full'>
      <GenreViewData genre={genre} />

      {session.isLoggedIn &&
        (confirmDelete ? (
          <div className='border-t'>
            <div className='flex justify-center mt-1 text-gray-800'>
              Are you sure?
            </div>
            <div className='flex p-1 space-x-1'>
              {isDeleting ? (
                <ButtonPrimary
                  type='submit'
                  className='flex-1 flex items-center justify-center space-x-2'
                  disabled
                >
                  <Loader className='text-white' size={16} />
                  <div>Deleting...</div>
                </ButtonPrimary>
              ) : (
                <ButtonPrimaryRed
                  className='flex-1'
                  onClick={() => handleDelete()}
                >
                  Delete
                </ButtonPrimaryRed>
              )}
              <ButtonTertiary
                className='flex-1'
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </ButtonTertiary>
            </div>
          </div>
        ) : (
          <div className='flex p-1 space-x-1 border-t'>
            <ButtonPrimary
              className='flex-1'
              onClick={() =>
                router.push({
                  pathname: '/genres/[id]/edit',
                  query: { id: genre.id.toString() },
                })
              }
            >
              Edit
            </ButtonPrimary>
            <ButtonTertiary
              className='flex-1'
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </ButtonTertiary>
          </div>
        ))}
    </div>
  )
}

export default GenreView
