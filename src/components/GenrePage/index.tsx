import clsx from 'clsx'
import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useSession } from '../../services/auth'
import GenreCreate from './GenreCreate'
import GenreEdit from './GenreEdit'
import { GenreFormFields } from './GenreForm'
import GenreHistory from './GenreHistory'
import GenreNavigator from './GenreNavigator'
import GenreView from './GenreView'
import GenreViewPlaceholder from './GenreViewPlaceholder'

export type GenrePageState =
  | { type: 'default'; id?: undefined }
  | { type: 'view'; id: number; scrollTo?: number }
  | { type: 'history'; id: number }
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

  const renderGenre = useCallback(() => {
    switch (state.type) {
      case 'default':
        return <GenreViewPlaceholder />
      case 'view':
        return <GenreView id={state.id} />
      case 'history':
        return <GenreHistory id={state.id} />
      case 'edit':
        return <GenreEdit id={state.id} autoFocus={state.autoFocus} />
      case 'create':
        return <GenreCreate />
    }
  }, [state])

  return (
    <div className={clsx('w-full h-full flex items-center', 'md:bg-texture')}>
      <div
        className={clsx('w-full h-full flex flex-col items-center', 'md:p-4')}
      >
        <div
          className={clsx(
            'flex-1 min-h-0 flex justify-center w-full',
            'md:space-x-4'
          )}
        >
          <div
            className={clsx(
              'flex-[1] min-w-[250px] bg-white',
              'md:max-w-[350px] md:border md:shadow-sm md:rounded-sm',
              // default -> always show
              // other -> hidden by default, show at md
              state.type !== 'default' && 'hidden md:block'
            )}
          >
            <GenreNavigator
              selectedGenreId={state.id}
              scrollTo={'scrollTo' in state ? state.scrollTo : undefined}
            />
          </div>
          <div
            className={clsx(
              'flex-[3] bg-white',
              'md:max-w-[800px] md:border md:shadow-sm md:rounded-sm',
              // default -> hidden by default, show at md
              // other -> always show
              state.type === 'default' && 'hidden md:block'
            )}
          >
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
