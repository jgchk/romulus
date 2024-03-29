import { useSession } from '../../../services/auth'
import { twsx } from '../../../utils/dom'
import Button from '../../common/Button'
import Card from '../../common/Card'
import IconButton from '../../common/IconButton'
import GenreSearchResults from './Search'
import SearchInput from './SearchInput'
import GenreNavigatorSettings from './Settings'
import GenreTree from './Tree'
import { useSearchState } from './search-state'
import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useState } from 'react'
import { RiSettings3Fill } from 'react-icons/ri'

const GenreNavigator: FC<{ className?: string }> = ({ className }) => {
  const session = useSession()

  const [showSettings, setShowSettings] = useState(false)

  const clearFilter = useSearchState((state) => state.clearFilter)
  const isSearching = useSearchState((state) => !!state.debouncedFilter)

  return (
    <Card className={twsx('flex h-full w-full flex-col', className)}>
      <div className='flex space-x-1 border-b border-gray-200 p-4 transition dark:border-gray-800'>
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
        <div className='border-b border-gray-200 p-4 transition dark:border-gray-800'>
          <GenreNavigatorSettings />
        </div>
      )}
      {isSearching && (
        <div className='flex justify-center'>
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
        <div className='border-t border-gray-200 p-1 transition dark:border-gray-800'>
          <Link href='/genres?view=create' className='w-full'>
            <Button template='secondary' className='w-full'>
              New Genre
            </Button>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default GenreNavigator
