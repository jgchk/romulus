import clsx from 'clsx'
import Link from 'next/link'
import { FC, useCallback } from 'react'

import { useSession } from '../../services/auth'
import GenreNavigator from './GenreNavigator'
import GenreCreate from './GenreView/Create'
import GenreViewPlaceholder from './GenreView/Default'
import GenreEdit from './GenreView/Edit'
import { GenreFormFields } from './GenreView/Form'
import GenreHistory from './GenreView/History'
import GenreView from './GenreView/View'

export type GenrePageView =
  | { type: 'default' }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'history'; id: number }
  | { type: 'create' }

const GenrePage: FC<{ view: GenrePageView }> = ({ view }) => {
  const session = useSession()

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
    <div className={clsx('flex h-full w-full items-center', 'md:bg-texture')}>
      <div
        className={clsx('flex h-full w-full flex-col items-center', 'md:p-4')}
      >
        <div
          className={clsx(
            'flex min-h-0 w-full flex-1 justify-center',
            'md:space-x-4'
          )}
        >
          <div
            className={clsx(
              'min-w-[250px] flex-[1] bg-white',
              'md:max-w-[350px] md:rounded-sm md:border md:shadow-sm',
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
              'md:max-w-[800px] md:rounded-sm md:border md:shadow-sm',
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
              <a className='text-primary-500 hover:underline'>Log in</a>
            </Link>{' '}
            to create and edit genres.
          </div>
        )}
      </div>
    </div>
  )
}

export default GenrePage
