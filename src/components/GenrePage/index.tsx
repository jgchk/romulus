import Link from 'next/link'
import { FC } from 'react'

import { useSession } from '../../services/auth'
import { DialogProvider } from './DialogContext'
import GenreView from './GenreView'
import TreeView from './TreeView'

const GenrePage: FC<{ selectedGenreId?: number }> = ({ selectedGenreId }) => {
  const session = useSession()

  return (
    <DialogProvider>
      <div className='bg-texture w-full h-full flex items-center'>
        <div className='w-full flex flex-col items-center'>
          <div className='flex justify-center space-x-4'>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm '>
              <TreeView selectedGenreId={selectedGenreId} />
            </div>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm'>
              <GenreView id={selectedGenreId} />
            </div>
          </div>

          {session.isLoggedOut && (
            <div className='mt-6 text-gray-700'>
              <Link href='/login'>
                <a className='text-blue-500 hover:underline'>Log in</a>
              </Link>{' '}
              to create and edit genres.
            </div>
          )}
        </div>
      </div>
    </DialogProvider>
  )
}

export default GenrePage
