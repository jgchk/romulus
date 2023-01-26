import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useState } from 'react'
import { RiSettings3Fill } from 'react-icons/ri'

import { useSession } from '../../../services/auth'
import { twsx } from '../../../utils/dom'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import GenreSearchResults from './Search'
import { useSearchState } from './search-state'
import SearchInput from './SearchInput'
import GenreNavigatorSettings from './Settings'
import GenreTree from './Tree'

const GenreNavigator: FC<{ className?: string }> = ({ className }) => {
  const session = useSession()

  const [showSettings, setShowSettings] = useState(false)

  const clearFilter = useSearchState((state) => state.clearFilter)
  const isSearching = useSearchState((state) => !!state.debouncedFilter)

  return (
    <div className={twsx('flex h-full w-full flex-col', className)}>
      <div className='flex space-x-1 border-b border-gray-100 p-4'>
        <div className='relative flex-1'>
          <SearchInput />
        </div>
        <div className='flex h-full items-center'>
          <IconButton
            title='Settings'
            onClick={() => setShowSettings(!showSettings)}
          >
            <RiSettings3Fill />
          </IconButton>
        </div>
      </div>
      {showSettings && (
        <div className='border-b p-4'>
          <GenreNavigatorSettings />
        </div>
      )}
      {isSearching && (
        <div className='flex justify-center border-b border-gray-100'>
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
        {isSearching ? <GenreSearchResults /> : <GenreTree />}
      </div>
      {session.isLoggedIn && session.hasPermission(Permission.EDIT_GENRES) && (
        <div className='border-t p-1'>
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
