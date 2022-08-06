import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { DefaultGenre } from '../server/db/genre'
import { useAddGenreMutation } from '../services/genres'
import Dialog from './Dialog'
import GenreForm, { GenreFormData } from './GenreForm'

const CreateGenreDialog: FC<{
  onClose: () => void
  onCreate: (genre: DefaultGenre) => void
}> = ({ onClose, onCreate }) => {
  const { mutate } = useAddGenreMutation()
  const handleCreate = useCallback(
    (data: GenreFormData) =>
      mutate(
        {
          ...data,
          shortDescription: data.shortDescription ?? undefined,
          longDescription: data.longDescription ?? undefined,
        },
        {
          onSuccess: (data) => {
            toast.success(`Created genre '${data.name}'`)
            onCreate(data)
            onClose()
          },
        }
      ),
    [mutate, onClose, onCreate]
  )

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div className='text-lg font-bold text-gray-600 mb-4'>New Genre</div>
        <GenreForm
          onSubmit={(data) => handleCreate(data)}
          onClose={() => onClose()}
        />
      </div>
    </Dialog>
  )
}

export default CreateGenreDialog
