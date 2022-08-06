import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useCallback, useState } from 'react'

import { useSession } from '../services/auth'
import { useGenresQuery } from '../services/genres'
import CreateGenreDialog from './CreateGenreDialog'
import DeleteGenreDialog from './DeleteGenreDialog'
import EditGenreDialog from './EditGenreDialog'
import { GenreFormFields } from './GenreForm'
import GenreTree from './GenreTree'
import ViewGenre from './ViewGenre'

type DialogState =
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'create' }
  | { type: 'delete'; id: number }

const GenrePage: FC<{ selectedGenreId?: number }> = ({ selectedGenreId }) => {
  const session = useSession()
  const router = useRouter()

  const [dialogState, setDialogState] = useState<DialogState>()

  const genresQuery = useGenresQuery()

  const renderGenreTree = useCallback(() => {
    if (genresQuery.data) {
      return (
        <div className='w-full h-full flex flex-col'>
          <div className='flex-1 p-4 overflow-auto'>
            <GenreTree genres={genresQuery.data} selectedId={selectedGenreId} />
          </div>
          {session.isLoggedIn && (
            <button
              className='border-t text-gray-400 font-bold p-1 hover:bg-gray-100 hover:text-gray-500'
              onClick={() => setDialogState({ type: 'create' })}
            >
              New Genre
            </button>
          )}
        </div>
      )
    }

    if (genresQuery.error) {
      return (
        <div className='w-full h-full flex items-center justify-center text-red-600'>
          Error fetching genres :(
        </div>
      )
    }

    return (
      <div className='w-full h-full flex items-center justify-center text-gray-400'>
        Loading...
      </div>
    )
  }, [genresQuery.data, genresQuery.error, session.isLoggedIn, selectedGenreId])

  const renderViewGenre = useCallback(() => {
    if (selectedGenreId === undefined) {
      return (
        <div className='w-full h-full flex items-center justify-center text-gray-400'>
          Select a genre
        </div>
      )
    }

    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex-1 p-4 overflow-auto'>
          <ViewGenre
            id={selectedGenreId}
            onEditGenre={(id, autoFocus) =>
              setDialogState({ type: 'edit', id, autoFocus })
            }
          />
        </div>
        {session.isLoggedIn && (
          <div className='w-full flex'>
            <button
              className='flex-1 border-t text-gray-400 font-bold p-1 hover:bg-gray-100 hover:text-gray-500'
              onClick={() =>
                setDialogState({ type: 'edit', id: selectedGenreId })
              }
            >
              Edit
            </button>
            <button
              className='flex-1 border-t text-gray-400 font-bold p-1 hover:bg-gray-100 hover:text-gray-500'
              onClick={() =>
                setDialogState({ type: 'delete', id: selectedGenreId })
              }
            >
              Delete
            </button>
          </div>
        )}
      </div>
    )
  }, [session.isLoggedIn, selectedGenreId])

  return (
    <>
      <div className='bg-texture w-full h-full flex items-center'>
        <div className='w-full flex flex-col items-center'>
          <div className='flex justify-center space-x-4'>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm '>
              {renderGenreTree()}
            </div>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm'>
              {renderViewGenre()}
            </div>
          </div>

          {session.isLoggedOut && (
            <div className='mt-6 text-gray-700'>
              <Link href='/login'>
                <a className='text-blue-500 hover:underline'>Log in</a>
              </Link>{' '}
              to create and edit genres.
            </div>
          )}
        </div>
      </div>

      {dialogState && dialogState.type === 'create' && (
        <CreateGenreDialog
          onClose={() => setDialogState(undefined)}
          onCreate={(genre) => router.push(`/genres/${genre.id}`)}
        />
      )}
      {dialogState && dialogState.type === 'edit' && (
        <EditGenreDialog
          id={dialogState.id}
          onClose={() => setDialogState(undefined)}
          autoFocus={dialogState.autoFocus}
        />
      )}
      {dialogState && dialogState.type === 'delete' && (
        <DeleteGenreDialog
          id={dialogState.id}
          onDelete={() => router.push('/genres')}
          onClose={() => setDialogState(undefined)}
        />
      )}
    </>
  )
}

export default GenrePage
