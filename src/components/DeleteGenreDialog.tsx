import { FC, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'

import { useDeleteGenreMutation, useGenreQuery } from '../services/genres'
import Dialog from './Dialog'

const DeleteGenreDialog: FC<{
  id: number
  onClose: () => void
  onDelete: () => void
}> = ({ id, onClose, onDelete }) => {
  const genreQuery = useGenreQuery(id)

  const genreName = useMemo(
    () => genreQuery.data?.name,
    [genreQuery.data?.name]
  )

  const { mutate } = useDeleteGenreMutation()
  const handleDelete = useCallback(() => {
    let message = 'Deleted genre'
    if (genreName) {
      message += ` '${genreName}'`
    }

    mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(message)
          onDelete()
          onClose()
        },
      }
    )
  }, [genreName, id, mutate, onClose, onDelete])

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div>
          Are you sure you want to delete {`'${genreName}'` ?? 'this genre'}?
        </div>
        <div className='flex mt-4'>
          <button
            className='flex-1 bg-blue-600 rounded-sm text-white font-bold p-1'
            onClick={() => handleDelete()}
          >
            Delete
          </button>
          <button
            className='flex-1 text-gray-600 rounded-sm font-bold p-1'
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default DeleteGenreDialog
