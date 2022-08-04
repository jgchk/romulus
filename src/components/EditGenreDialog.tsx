import { FC, useCallback } from 'react'
import toast from 'react-hot-toast'

import { useEditGenreMutation, useGenreQuery } from '../services/genres'
import Dialog from './Dialog'
import GenreForm, { GenreFormData, GenreFormFields } from './GenreForm'

const EditGenreDialog: FC<{
  id: number
  onClose: () => void
  autoFocus?: keyof GenreFormFields
}> = ({ id, onClose, autoFocus }) => {
  const { mutate } = useEditGenreMutation()
  const onSubmit = useCallback(
    (data: GenreFormData) =>
      mutate(
        { id, data },
        {
          onSuccess: (data) => {
            toast.success(`Updated genre '${data.name}'`)
            onClose()
          },
        }
      ),
    [id, mutate, onClose]
  )

  const genreQuery = useGenreQuery(id)
  const renderForm = useCallback(() => {
    if (genreQuery.data) {
      return (
        <GenreForm
          genre={genreQuery.data}
          onSubmit={(data) => onSubmit(data)}
          onClose={() => onClose()}
          autoFocus={autoFocus}
        />
      )
    }

    if (genreQuery.error) {
      return <div>Error fetching genre data</div>
    }

    return <div>Loading...</div>
  }, [autoFocus, genreQuery.data, genreQuery.error, onClose, onSubmit])

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div className='text-lg font-bold text-gray-600 mb-4'>Edit Genre</div>
        {renderForm()}
      </div>
    </Dialog>
  )
}

export default EditGenreDialog
