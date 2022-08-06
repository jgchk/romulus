import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { DefaultGenre } from '../server/db/genre'
import GenreMultiselect from './GenreMultiselect'
import MarkdownEditor from './MarkdownEditor'

export type GenreFormFields = {
  name: string
  shortDescription: string
  longDescription: string
}

export type GenreFormData = {
  name: string
  shortDescription: string | null
  longDescription: string | null
  parentGenres: number[]
  childGenres: number[]
}

const GenreForm: FC<{
  genre?: DefaultGenre
  onSubmit: (data: GenreFormData) => void
  onClose: () => void
  autoFocus?: keyof GenreFormFields
}> = ({ genre, onSubmit, onClose, autoFocus }) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<GenreFormFields>({
    defaultValues: {
      name: genre?.name ?? '',
      shortDescription: genre?.shortDescription ?? '',
      longDescription: genre?.longDescription ?? '',
    },
  })

  const [parentGenres, setParentGenres] = useState<number[]>(
    genre?.parentGenres.map((genre) => genre.id) ?? []
  )
  const [childGenres, setChildGenres] = useState<number[]>(
    genre?.childGenres.map((genre) => genre.id) ?? []
  )

  const submitHandler = useCallback(
    (data: GenreFormFields) =>
      onSubmit({
        name: data.name,
        shortDescription:
          data.shortDescription.length > 0 ? data.shortDescription : null,
        longDescription:
          data.longDescription.length > 0 ? data.longDescription : null,
        parentGenres,
        childGenres,
      }),
    [childGenres, onSubmit, parentGenres]
  )

  useEffect(() => setFocus(autoFocus ?? 'name'), [autoFocus, setFocus])

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div className='space-y-3 w-[500px]'>
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
          <label className='block text-gray-700 text-sm'>Parent Genres</label>
          <GenreMultiselect
            excludeIds={genre !== undefined ? [genre.id] : []}
            selectedIds={parentGenres}
            onChange={(g) => setParentGenres(g)}
          />
        </div>

        <div>
          <label className='block text-gray-700 text-sm'>Child Genres</label>
          <GenreMultiselect
            excludeIds={genre !== undefined ? [genre.id] : []}
            selectedIds={childGenres}
            onChange={(g) => setChildGenres(g)}
          />
        </div>

        <div>
          <label
            htmlFor='short-description'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.shortDescription && 'text-red-600'
            )}
          >
            Short Description
          </label>
          <textarea
            id='short-description'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5 w-full',
              errors.shortDescription && 'border-red-600 outline-red-600'
            )}
            {...register('shortDescription')}
          />
          {errors.shortDescription && (
            <div className='text-sm text-red-600'>
              {errors.shortDescription.message}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor='long-description'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.longDescription && 'text-red-600'
            )}
          >
            Long Description
          </label>
          <Controller
            name='longDescription'
            control={control}
            render={({ field }) => (
              <MarkdownEditor id='long-description' {...field} />
            )}
          />
          {errors.longDescription && (
            <div className='text-sm text-red-600'>
              {errors.longDescription.message}
            </div>
          )}
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
