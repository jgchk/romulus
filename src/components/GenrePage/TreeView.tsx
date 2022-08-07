import { useRouter } from 'next/router'
import { FC } from 'react'

import { useSession } from '../../services/auth'
import { useGenresQuery } from '../../services/genres'
import { ButtonSecondary } from '../common/Button'
import GenreTree from './GenreTree'

const TreeView: FC<{
  selectedGenreId?: number
}> = ({ selectedGenreId }) => {
  const genresQuery = useGenresQuery()
  const session = useSession()
  const router = useRouter()

  if (genresQuery.data) {
    return (
      <div className='w-full h-full flex flex-col'>
        <div className='flex-1 p-4 overflow-auto'>
          <GenreTree genres={genresQuery.data} selectedId={selectedGenreId} />
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

  if (genresQuery.error) {
    return (
      <div className='w-full h-full flex items-center justify-center text-red-600'>
        Error fetching genres :(
      </div>
    )
  }

  return (
    <div className='w-full h-full flex items-center justify-center text-gray-400'>
      Loading...
    </div>
  )
}

export default TreeView
