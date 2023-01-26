import { Permission } from '@prisma/client'
import Link from 'next/link'
import { FC, useCallback, useState } from 'react'
import { RiSettings3Fill } from 'react-icons/ri'

import useDebouncedState from '../../../hooks/useDebouncedState'
import { useSession } from '../../../services/auth'
import { twsx } from '../../../utils/dom'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Input from '../../common/Input'
import GenreSearchResults from './Search'
import GenreNavigatorSettings from './Settings'
import GenreTree from './Tree'

const GenreNavigator: FC<{ className?: string }> = ({ className }) => {
  const session = useSession()

  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState('')
  const [debouncedFilter, setDebouncedFilter] = useDebouncedState(filter, 500)

  const clearFilter = useCallback(() => {
    setFilter('')
    setDebouncedFilter('')
  }, [setDebouncedFilter])

  return (
    <div className={twsx('flex h-full w-full flex-col', className)}>
      <div className='flex space-x-1 border-b border-gray-100 p-4'>
        <div className='relative flex-1'>
          <Input
            value={filter}
            onChange={setFilter}
            placeholder='Filter...'
            showClear
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setFilter(e.currentTarget.value)
                setDebouncedFilter(e.currentTarget.value)
              }
            }}
          />
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
      {debouncedFilter && (
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
