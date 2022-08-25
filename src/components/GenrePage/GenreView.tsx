import { Permission } from '@prisma/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../../server/db/genre/outputs'
import { DefaultGenreHistory } from '../../server/db/genre-history/outputs'
import { useSession } from '../../services/auth'
import { useGenreHistoryQuery } from '../../services/genre-history'
import { useDeleteGenreMutation, useGenreQuery } from '../../services/genres'
import {
  ButtonPrimary,
  ButtonPrimaryRed,
  ButtonTertiary,
} from '../common/Button'
import { CenteredLoader } from '../common/Loader'
import GenreViewData from './GenreViewData'

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
      <div className='p-4 h-full flex flex-col items-center justify-center text-gray-700'>
        <div>Error fetching genre :(</div>
        {hasHistory && (
          <Link
            href={{
              pathname: '/genres/[id]/history',
              query: { id: id.toString() },
            }}
          >
            <a className='block text-blue-500 hover:underline'>View history</a>
          </Link>
        )}
      </div>
    )
  }
  if (historyQuery.error) {
    return (
      <div className='p-4 h-full flex items-center justify-center text-gray-700'>
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
    <div className='flex flex-col h-full'>
      <GenreViewData genre={genre} history={history} />

      {session.isLoggedIn &&
        session.hasPermission(Permission.EDIT_GENRES) &&
        (confirmDelete ? (
          <div className='border-t'>
            <div className='flex justify-center mt-1 text-gray-800'>
              Are you sure?
            </div>
            <div className='flex p-1 space-x-1'>
              <ButtonPrimaryRed
                type='submit'
                className='flex-1 flex items-center justify-center space-x-2'
                disabled={isDeleting}
                loading={isDeleting}
                onClick={() => handleDelete()}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ButtonPrimaryRed>
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
            <Link
              href={{
                pathname: '/genres/[id]/edit',
                query: { id: genre.id.toString() },
              }}
            >
              <a className='flex-1'>
                <ButtonPrimary className='w-full'>Edit</ButtonPrimary>
              </a>
            </Link>
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
