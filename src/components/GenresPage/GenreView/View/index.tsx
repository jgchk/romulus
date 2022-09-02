import { Permission } from '@prisma/client'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../../../server/db/genre/outputs'
import { DefaultGenreHistory } from '../../../../server/db/genre-history/outputs'
import { useSession } from '../../../../services/auth'
import { useGenreHistoryQuery } from '../../../../services/genre-history'
import {
  useDeleteGenreMutation,
  useGenreQuery,
} from '../../../../services/genres'
import Button from '../../../common/Button'
import GenreLink from '../../../common/GenreLink'
import { CenteredLoader } from '../../../common/Loader'
import GenreViewData from './ViewData'

export const GenreView: FC<{
  id: number
}> = ({ id }) => {
  const genreQuery = useGenreQuery(id)
  const historyQuery = useGenreHistoryQuery(id)

  const hasHistory = useMemo(
    () => historyQuery.data && historyQuery.data.length > 0,
    [historyQuery.data]
  )

  if (genreQuery.data && historyQuery.data) {
    return <HasData genre={genreQuery.data} history={historyQuery.data} />
  }

  if (genreQuery.error) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-4 text-gray-700'>
        <div>Error fetching genre :(</div>
        {hasHistory && (
          <GenreLink
            id={id}
            view='history'
            className='block text-primary-500 hover:underline'
          >
            View history
          </GenreLink>
        )}
      </div>
    )
  }
  if (historyQuery.error) {
    return (
      <div className='flex h-full items-center justify-center p-4 text-gray-700'>
        Error fetching genre history :(
      </div>
    )
  }

  return <CenteredLoader />
}

const HasData: FC<{
  genre: DefaultGenre
  history: DefaultGenreHistory[]
}> = ({ genre, history }) => {
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
          onSuccess: async () => {
            toast.success(`Deleted genre '${genre.name}'`)
            await router.push({ pathname: '/genres' })
          },
        }
      ),
    [deleteGenre, genre.id, genre.name, router]
  )

  return (
    <div className='flex h-full flex-col'>
      <GenreViewData genre={genre} history={history} />

      {session.isLoggedIn &&
        session.hasPermission(Permission.EDIT_GENRES) &&
        (confirmDelete ? (
          <div className='border-t'>
            <div className='mt-1 flex justify-center text-gray-800'>
              Are you sure?
            </div>
            <div className='flex space-x-1 p-1'>
              <Button
                template='danger'
                type='submit'
                className='flex-1'
                loading={isDeleting}
                onClick={() => handleDelete()}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                template='tertiary'
                className='flex-1'
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex space-x-1 border-t p-1'>
            <GenreLink id={genre.id} view='edit' className='flex-1'>
              <Button className='w-full'>Edit</Button>
            </GenreLink>
            <Button
              template='tertiary'
              className='flex-1'
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        ))}
    </div>
  )
}

export default GenreView
