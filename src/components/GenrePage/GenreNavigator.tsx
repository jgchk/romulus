import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { RiCloseFill, RiSettings3Fill } from 'react-icons/ri'

import useDebounce from '../../hooks/useDebounce'
import { useSession } from '../../services/auth'
import { ButtonSecondary } from '../common/Button'
import GenreSearchResults from './GenreSearchResults'
import GenreTree from './GenreTree'
import GenreTreeSettings from './GenreTreeSettings'

const GenreNavigator: FC<{ selectedGenreId?: number }> = ({
  selectedGenreId,
}) => {
  const session = useSession()
  const router = useRouter()

  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('')
  const debouncedFilter = useDebounce(filter, 200)

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
                onClick={() => setFilter('')}
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
          <GenreTreeSettings />
        </div>
      )}
      <div className='flex-1 overflow-auto'>
        {debouncedFilter ? (
          <GenreSearchResults filter={debouncedFilter} setFilter={setFilter} />
        ) : (
          <GenreTree selectedGenreId={selectedGenreId} />
        )}
      </div>
      {session.isLoggedIn && (
        <div className='p-1 border-t'>
          <ButtonSecondary
            className='w-full'
            onClick={() => router.push({ pathname: '/genres/create' })}
          >
            New Genre
          </ButtonSecondary>
        </div>
      )}
    </div>
  )
}

export default GenreNavigator
