import Link from 'next/link'
import { FC } from 'react'

import { useSession } from '../../services/auth'
import GenreCreate from './GenreCreate'
import GenreEdit from './GenreEdit'
import { GenreFormFields } from './GenreForm'
import GenreView from './GenreView'
import GenreViewPlaceholder from './GenreViewPlaceholder'
import TreeView from './TreeView'

export type GenrePageState =
  | { type: 'default'; id?: undefined }
  | { type: 'view'; id: number }
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

  return (
    <div className='bg-texture w-full h-full flex items-center'>
      <div className='w-full flex flex-col items-center'>
        <div className='flex justify-center space-x-4'>
          <div className='w-[250px] h-[800px] border bg-white shadow-sm '>
            <TreeView selectedGenreId={state.id} />
          </div>
          <div className='w-[800px] h-[800px] border bg-white shadow-sm'>
            {state.type === 'default' && <GenreViewPlaceholder />}
            {state.type === 'view' && <GenreView id={state.id} />}
            {state.type === 'edit' && (
              <GenreEdit id={state.id} autoFocus={state.autoFocus} />
            )}
            {state.type === 'create' && <GenreCreate />}
          </div>
        </div>

        {session.isLoggedOut && (
          <div className='mt-6 text-gray-700'>
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
