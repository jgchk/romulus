import type { NextPage } from 'next'
import { useCallback, useState } from 'react'
import CreateGenreDialog from '../../components/CreateGenreDialog'
import EditGenreDialog from '../../components/EditGenreDialog'
import GenreTree from '../../components/GenreTree'
import ViewGenre from '../../components/ViewGenre'
import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'

type DialogState = { type: 'edit'; id: number } | { type: 'create' }

const Genres: NextPage = () => {
  const session = useSession()

  const [viewingGenreId, setViewingGenreId] = useState<number>()
  const [dialogState, setDialogState] = useState<DialogState>()

  const genresQuery = useGenresQuery()

  const renderGenreTree = useCallback(() => {
    if (genresQuery.data) {
      return (
        <div className='w-full h-full flex flex-col'>
          <div className='flex-1'>
            <GenreTree
              genres={genresQuery.data}
              onClickGenre={(id) => setViewingGenreId(id)}
              selectedId={viewingGenreId}
            />
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
        <div className='w-full h-full flex items-center justify-center'>
          Error fetching genres :(
        </div>
      )
    }

    return (
      <div className='w-full h-full flex items-center justify-center'>
        Loading...
      </div>
    )
  }, [genresQuery.data, genresQuery.error, session.isLoggedIn, viewingGenreId])

  const renderViewGenre = useCallback(() => {
    if (viewingGenreId === undefined) {
      return (
        <div className='w-full h-full flex items-center justify-center text-gray-400'>
          Select a genre
        </div>
      )
    }

    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex-1'>
          <ViewGenre
            id={viewingGenreId}
            onClickGenre={(id) => setViewingGenreId(id)}
          />
        </div>
        {session.isLoggedIn && (
          <button
            className='border-t text-gray-400 font-bold p-1 hover:bg-gray-100 hover:text-gray-500'
            onClick={() => setDialogState({ type: 'edit', id: viewingGenreId })}
          >
            Edit
          </button>
        )}
      </div>
    )
  }, [session.isLoggedIn, viewingGenreId])

  return (
    <>
      <div className='bg-texture w-full h-full flex items-center justify-center'>
        <div className='flex justify-center space-x-4 w-full h-1/3'>
          <div className='w-1/3 h-full border bg-white shadow-sm '>
            {renderGenreTree()}
          </div>
          <div className='w-1/3 h-full border bg-white shadow-sm'>
            {renderViewGenre()}
          </div>
        </div>
      </div>

      {dialogState && dialogState.type === 'create' && (
        <CreateGenreDialog onClose={() => setDialogState(undefined)} />
      )}
      {dialogState && dialogState.type === 'edit' && (
        <EditGenreDialog
          id={dialogState.id}
          onClose={() => setDialogState(undefined)}
        />
      )}
    </>
  )
}

export default Genres
