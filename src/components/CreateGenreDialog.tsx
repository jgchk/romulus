import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAddGenreMutation } from '../services/genres'
import { isISO8601 } from '../utils/validators'
import Dialog from './Dialog'
import GenreMultiselect from './GenreMultiselect'

type FormData = {
  name: string
  description: string
  startDate: string
  endDate: string
}

const CreateGenreDialog: FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormData>()

  const [parentGenres, setParentGenres] = useState<number[]>([])
  const [childGenres, setChildGenres] = useState<number[]>([])

  const { mutate } = useAddGenreMutation()
  const onSubmit = useCallback(
    (data: FormData) => {
      console.log({ data })
      mutate(
        { ...data, parentGenres, childGenres },
        {
          onSuccess: (data) => {
            toast.success(`Created genre '${data.name}'`)
            onClose()
          },
        }
      )
    },
    [childGenres, mutate, onClose, parentGenres]
  )

  useEffect(() => setFocus('name'), [setFocus])

  return (
    <Dialog>
      <div className='border p-4 shadow bg-white'>
        <div className='text-lg font-bold text-gray-600 mb-4'>New Genre</div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-3'>
            <div>
              <label
                htmlFor='name'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.name && 'text-red-600'
                )}
              >
                Name
              </label>
              <input
                id='name'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5',
                  errors.name && 'border-red-600 outline-red-600'
                )}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <div className='text-sm text-red-600'>
                  {errors.name.message}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor='description'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.description && 'text-red-600'
                )}
              >
                Description
              </label>
              <input
                id='description'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5',
                  errors.description && 'border-red-600 outline-red-600'
                )}
                {...register('description', {
                  required: 'Description is required',
                })}
              />
              {errors.description && (
                <div className='text-sm text-red-600'>
                  {errors.description.message}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor='start-date'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.startDate && 'text-red-600'
                )}
              >
                Start Date
              </label>
              <input
                id='start-date'
                placeholder='YYYY-MM-DD'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5',
                  errors.startDate && 'border-red-600 outline-red-600'
                )}
                {...register('startDate', {
                  validate: (val) =>
                    !val || isISO8601(val) || 'Must be a valid date',
                })}
              />
              {errors.startDate && (
                <div className='text-sm text-red-600'>
                  {errors.startDate.message}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor='end-date'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.endDate && 'text-red-600'
                )}
              >
                End Date
              </label>
              <input
                id='end-date'
                placeholder='YYYY-MM-DD'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5',
                  errors.endDate && 'border-red-600 outline-red-600'
                )}
                {...register('endDate', {
                  validate: (val) =>
                    !val || isISO8601(val) || 'Must be a valid date',
                })}
              />
              {errors.endDate && (
                <div className='text-sm text-red-600'>
                  {errors.endDate.message}
                </div>
              )}
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
