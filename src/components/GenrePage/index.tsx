import clsx from 'clsx'
import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useSession } from '../../services/auth'
import { useGenrePageContext } from './context'
import GenreCreate from './GenreCreate'
import GenreEdit from './GenreEdit'
import GenreHistory from './GenreHistory'
import GenreNavigator from './GenreNavigator'
import GenreView from './GenreView'
import GenreViewPlaceholder from './GenreViewPlaceholder'

const GenrePage: FC = () => {
  const session = useSession()

  const { view } = useGenrePageContext()
  const renderGenre = useCallback(() => {
    switch (view.type) {
      case 'default':
        return <GenreViewPlaceholder />
      case 'view':
        return <GenreView id={view.id} />
      case 'history':
        return <GenreHistory id={view.id} />
      case 'edit':
        return <GenreEdit id={view.id} autoFocus={view.autoFocus} />
      case 'create':
        return <GenreCreate />
    }
  }, [view])

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
              view.type !== 'default' && 'hidden md:block'
            )}
          >
            <GenreNavigator />
          </div>
          <div
            className={clsx(
              'flex-[3] bg-white',
              'md:max-w-[800px] md:border md:shadow-sm md:rounded-sm',
              // default -> hidden by default, show at md
              // other -> always show
              view.type === 'default' && 'hidden md:block'
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
