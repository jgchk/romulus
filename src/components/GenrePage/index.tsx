import Link from 'next/link'
import { FC } from 'react'

import { useSession } from '../../services/auth'
import { GenreFormFields } from '../GenreForm'
import { DialogProvider } from './DialogContext'
import GenreCreate from './GenreCreate'
import GenreDelete from './GenreDelete'
import GenreEdit from './GenreEdit'
import GenreView from './GenreView'
import GenreViewPlaceholder from './GenreViewPlaceholder'
import TreeView from './TreeView'

export type GenrePageState =
  | { type: 'default'; id?: undefined }
  | { type: 'view'; id: number }
  | { type: 'edit'; id: number; autoFocus?: keyof GenreFormFields }
  | { type: 'delete'; id: number }
  | { type: 'create'; id?: undefined }

export const genrePageState = {
  view: (id: number): GenrePageState => ({ type: 'view', id }),
  edit: (id: number, autoFocus?: keyof GenreFormFields): GenrePageState => ({
    type: 'edit',
    id,
    autoFocus,
  }),
  delete: (id: number): GenrePageState => ({ type: 'delete', id }),
  create: (): GenrePageState => ({ type: 'create' }),
}

const GenrePage: FC<{ state: GenrePageState }> = ({ state }) => {
  const session = useSession()

  return (
    <DialogProvider>
      <div className='bg-texture w-full h-full flex items-center'>
        <div className='w-full flex flex-col items-center'>
          <div className='flex justify-center space-x-4'>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm '>
              <TreeView selectedGenreId={state.id} />
            </div>
            <div className='w-[500px] h-[500px] border bg-white shadow-sm'>
              {state.type === 'default' && <GenreViewPlaceholder />}
              {state.type === 'view' && <GenreView id={state.id} />}
              {state.type === 'edit' && (
                <GenreEdit id={state.id} autoFocus={state.autoFocus} />
              )}
              {state.type === 'delete' && <GenreDelete id={state.id} />}
              {state.type === 'create' && <GenreCreate />}
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
