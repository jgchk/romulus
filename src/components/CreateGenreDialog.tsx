import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAddGenreMutation } from '../services/genres'
import Dialog from './Dialog'
import GenreForm, { CompleteData } from './GenreForm'

const CreateGenreDialog: FC<{ onClose: () => void }> = ({ onClose }) => {
  const { mutate } = useAddGenreMutation()
  const onSubmit = useCallback(
    (data: CompleteData) =>
      mutate(
        {
          ...data,
          shortDescription: data.shortDescription ?? undefined,
          longDescription: data.longDescription ?? undefined,
        },
        {
          onSuccess: (data) => {
            toast.success(`Created genre '${data.name}'`)
            onClose()
          },
        }
      ),
    [mutate, onClose]
  )

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div className='text-lg font-bold text-gray-600 mb-4'>New Genre</div>
        <GenreForm
          onSubmit={(data) => onSubmit(data)}
          onClose={() => onClose()}
        />
      </div>
    </Dialog>
  )
}

export default CreateGenreDialog
