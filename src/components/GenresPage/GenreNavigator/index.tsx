import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useCallback, useState } from 'react'
import { RiCloseFill, RiSettings3Fill } from 'react-icons/ri'

import useDebounce from '../../../hooks/useDebounce'
import { useSession } from '../../../services/auth'
import Button from '../../common/Button'
import GenreSearchResults from './Search'
import GenreNavigatorSettings from './Settings'
import GenreTree from './Tree'

const GenreNavigator: FC = () => {
  const session = useSession()

  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useDebounce(filter, 200)

  const clearFilter = useCallback(() => {
    setFilter('')
    setDebouncedFilter('')
  }, [setDebouncedFilter])

  return (
    <div className='w-full h-full flex flex-col'>
      <div className='p-4 flex space-x-1 border-b'>
        <div className='flex-1 relative'>
          <input
            className='border rounded-sm p-1 px-2 pr-7 w-full'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Filter...'
          />
          {filter && (
            <div className='absolute right-1 top-0 h-full flex items-center'>
              <button
                className='p-1 hover:bg-gray-200 rounded-full text-gray-500'
                onClick={() => clearFilter()}
              >
                <RiCloseFill />
              </button>
            </div>
          )}
        </div>
        <button
          className='p-2 hover:bg-blue-100 hover:text-blue-600 rounded-sm text-gray-500'
          title='Settings'
          onClick={() => setShowSettings(!showSettings)}
        >
          <RiSettings3Fill />
        </button>
      </div>
      {showSettings && (
        <div className='border-b p-4'>
          <GenreNavigatorSettings />
        </div>
      )}
      {debouncedFilter && (
        <div className='border-b flex justify-center'>
          <Button
            template='tertiary'
            className='w-full'
            onClick={() => clearFilter()}
          >
            Back to Tree
          </Button>
        </div>
      )}
      <div className='flex-1 overflow-auto'>
        {debouncedFilter ? (
          <GenreSearchResults
            filter={debouncedFilter}
            clearFilter={clearFilter}
          />
        ) : (
          <GenreTree />
        )}
      </div>
      {session.isLoggedIn && session.hasPermission(Permission.EDIT_GENRES) && (
        <div className='p-1 border-t'>
          <Link href={{ pathname: '/genres', query: { view: 'create' } }}>
            <a className='w-full'>
              <Button template='secondary' className='w-full'>
                New Genre
              </Button>
            </a>
          </Link>
        </div>
      )}
    </div>
  )
}

export default GenreNavigator
