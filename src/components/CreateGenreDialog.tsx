import { FC, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useAddGenreMutation } from '../services/genres'
import { useAutoFocus } from '../utils/hooks'
import Dialog from './Dialog'
import GenreMultiselect from './GenreMultiselect'

const CreateGenreDialog: FC<{ onClose: () => void }> = ({ onClose }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [parentGenres, setParentGenres] = useState<number[]>([])
  const [childGenres, setChildGenres] = useState<number[]>([])

  const { mutate } = useAddGenreMutation()

  const handleSubmit = useCallback(() => {
    mutate(
      { name, description, parentGenres, childGenres },
      {
        onSuccess: (data) => {
          toast.success(`Created genre '${data.name}'`)
          onClose()
        },
      }
    )
  }, [childGenres, description, mutate, name, onClose, parentGenres])

  const nameRef = useAutoFocus<HTMLInputElement>()

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div className='text-lg font-bold text-gray-600 mb-4'>New Genre</div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <div className='space-y-3'>
            <div>
              <label className='block text-gray-700 text-sm' htmlFor='name'>
                Name
              </label>
              <input
                ref={nameRef}
                className='border rounded-sm p-1 px-2 mt-0.5'
                id='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className='block text-gray-700 text-sm'
                htmlFor='description'
              >
                Description
              </label>
              <input
                className='border rounded-sm p-1 px-2 mt-0.5'
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className='block text-gray-700 text-sm'>
                Parent Genres
              </label>
              <GenreMultiselect
                selectedIds={parentGenres}
                onChange={(g) => setParentGenres(g)}
              />
            </div>

            <div>
              <label className='block text-gray-700 text-sm'>
                Child Genres
              </label>
              <GenreMultiselect
                selectedIds={childGenres}
                onChange={(g) => setChildGenres(g)}
              />
            </div>
          </div>

          <div className='flex space-x-1'>
            <button
              className='flex-1 bg-blue-600 rounded-sm text-white font-bold p-1 mt-4'
              type='submit'
            >
              Submit
            </button>
            <button
              className='flex-1 rounded-sm text-gray-600 font-bold p-1 mt-4'
              type='button'
              onClick={() => onClose()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  )
}

export default CreateGenreDialog
