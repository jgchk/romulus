import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { DefaultGenre } from '../server/db/genre'
import GenreMultiselect from './GenreMultiselect'

type FormData = {
  name: string
  description: string
  // startDate: string
  // endDate: string
}

export type CompleteData = {
  name: string
  description?: string
  // startDate?: string
  // endDate?: string
  parentGenres: number[]
  childGenres: number[]
}

const GenreForm: FC<{
  genre?: DefaultGenre
  onSubmit: (data: CompleteData) => void
  onClose: () => void
}> = ({ genre, onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<FormData>({
    defaultValues: {
      name: genre?.name ?? '',
      description: genre?.description ?? '',
      // startDate: genre?.startDate ?? '',
      // endDate: genre?.endDate ?? '',
    },
  })

  const [parentGenres, setParentGenres] = useState<number[]>(
    genre?.parentGenres.map((genre) => genre.id) ?? []
  )
  const [childGenres, setChildGenres] = useState<number[]>(
    genre?.childGenres.map((genre) => genre.id) ?? []
  )

  const submitHandler = useCallback(
    (data: FormData) =>
      onSubmit({
        name: data.name,
        description: data.description.length > 0 ? data.description : undefined,
        // startDate: data.startDate.length > 0 ? data.startDate : undefined,
        // endDate: data.endDate.length > 0 ? data.endDate : undefined,
        parentGenres,
        childGenres,
      }),
    [childGenres, onSubmit, parentGenres]
  )

  useEffect(() => setFocus('name'), [setFocus])

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
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
            <div className='text-sm text-red-600'>{errors.name.message}</div>
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
            {...register('description')}
          />
          {errors.description && (
            <div className='text-sm text-red-600'>
              {errors.description.message}
            </div>
          )}
        </div>

        {/* <div>
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
            <div className='text-sm text-red-600'>{errors.endDate.message}</div>
          )}
        </div> */}

        <div>
          <label className='block text-gray-700 text-sm'>Parent Genres</label>
          <GenreMultiselect
            selectedIds={parentGenres}
            onChange={(g) => setParentGenres(g)}
          />
        </div>

        <div>
          <label className='block text-gray-700 text-sm'>Child Genres</label>
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
  )
}

export default GenreForm
