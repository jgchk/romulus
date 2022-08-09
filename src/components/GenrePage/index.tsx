import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useBreakpoint } from '../../hooks/useBreakpoint'
import { useSession } from '../../services/auth'
import GenreCreate from './GenreCreate'
import GenreEdit from './GenreEdit'
import { GenreFormFields } from './GenreForm'
import GenreNavigator from './GenreNavigator'
import GenreView from './GenreView'
import GenreViewPlaceholder from './GenreViewPlaceholder'

export type GenrePageState =
  | { type: 'default'; id?: undefined }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'create'; id?: undefined }

export const genrePageState = {
  view: (id: number): GenrePageState => ({ type: 'view', id }),
  edit: (id: number, autoFocus?: keyof GenreFormFields): GenrePageState => ({
    type: 'edit',
    id,
    autoFocus,
  }),
  create: (): GenrePageState => ({ type: 'create' }),
}

const GenrePage: FC<{ state: GenrePageState }> = ({ state }) => {
  const session = useSession()

  const isDesktop = useBreakpoint('md')

  const renderGenre = useCallback(() => {
    switch (state.type) {
      case 'default':
        return <GenreViewPlaceholder />
      case 'view':
        return <GenreView id={state.id} />
      case 'edit':
        return <GenreEdit id={state.id} autoFocus={state.autoFocus} />
      case 'create':
        return <GenreCreate />
    }
  }, [state])

  if (!isDesktop) {
    return state.type === 'default' ? (
      <GenreNavigator selectedGenreId={state.id} />
    ) : (
      renderGenre()
    )
  }

  return (
    <div className='bg-texture w-full h-full flex items-center'>
      <div className='w-full h-full flex flex-col items-center p-4'>
        <div className='flex-1 min-h-0 flex justify-center w-full space-x-4'>
          <div className='flex-[1] max-w-[350px] border bg-white shadow-sm rounded-sm'>
            <GenreNavigator selectedGenreId={state.id} />
          </div>
          <div className='flex-[3] max-w-[800px] border bg-white shadow-sm rounded-sm'>
            {renderGenre()}
          </div>
        </div>

        {session.isLoggedOut && (
          <div className='mt-4 text-gray-700'>
            <Link href={{ pathname: '/login' }}>
              <a className='text-blue-500 hover:underline'>Log in</a>
            </Link>{' '}
            to create and edit genres.
          </div>
        )}
      </div>
    </div>
  )
}

export default GenrePage
