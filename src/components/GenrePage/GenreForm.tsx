import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { DefaultGenre } from '../../server/db/genre'
import { ifDefined } from '../../utils/types'
import { ButtonPrimary, ButtonTertiary } from '../common/Button'
import MarkdownEditor from '../common/MarkdownEditor'
import GenreMultiselect from './GenreMultiselect'

const GenreFormFields = {
  name: '',
  akas: '',
  shortDescription: '',
  longDescription: '',
  notes: '',
}

export type GenreFormFields = typeof GenreFormFields

export const isGenreFormField = (t: string): t is keyof GenreFormFields =>
  t in GenreFormFields

export type GenreFormData = {
  name: string
  akas: string[]
  shortDescription: string | null
  longDescription: string | null
  notes: string | null
  parentGenres: number[]
  influencedByGenres: number[]
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
      akas: ifDefined(genre?.akas, (akas) => akas.join(', ')),
      shortDescription: genre?.shortDescription ?? '',
      longDescription: genre?.longDescription ?? '',
      notes: genre?.notes ?? '',
    },
  })

  const [parentGenres, setParentGenres] = useState<number[]>(
    genre?.parentGenres.map((genre) => genre.id) ?? []
  )
  const [influencedByGenres, setInfluencedByGenres] = useState<number[]>(
    genre?.influencedByGenres.map((genre) => genre.id) ?? []
  )

  const submitHandler = useCallback(
    (data: GenreFormFields) =>
      onSubmit({
        name: data.name,
        akas: data.akas.split(',').map((s) => s.trim()),
        shortDescription:
          data.shortDescription.length > 0 ? data.shortDescription : null,
        longDescription:
          data.longDescription.length > 0 ? data.longDescription : null,
        notes: data.notes.length > 0 ? data.notes : null,
        parentGenres,
        influencedByGenres,
      }),
    [influencedByGenres, onSubmit, parentGenres]
  )

  useEffect(() => setFocus(autoFocus ?? 'name'), [autoFocus, setFocus])

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className='flex flex-col h-full'
    >
      <div className='space-y-3 w-full flex-1 overflow-auto p-4'>
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
            htmlFor='akas'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.akas && 'text-red-600'
            )}
          >
            AKAs
          </label>
          <input
            id='akas'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.akas && 'border-red-600 outline-red-600'
            )}
            {...register('akas')}
          />
          {errors.name && (
            <div className='text-sm text-red-600'>{errors.name.message}</div>
          )}
        </div>

        <div>
          <label className='block text-gray-700 text-sm'>Parents</label>
          <GenreMultiselect
            excludeIds={[
              ...(genre !== undefined ? [genre.id] : []),
              ...(genre?.childGenres.map(({ id }) => id) ?? []),
            ]}
            selectedIds={parentGenres}
            onChange={(g) => setParentGenres(g)}
          />
        </div>

        <div>
          <label className='block text-gray-700 text-sm'>Influences</label>
          <GenreMultiselect
            excludeIds={genre !== undefined ? [genre.id] : []}
            selectedIds={influencedByGenres}
            onChange={(g) => setInfluencedByGenres(g)}
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
            Long Description{' '}
            <a
              href='https://www.markdownguide.org/cheat-sheet'
              target='_blank'
              rel='noreferrer'
              className='text-blue-500 hover:underline text-xs'
            >
              (Formatting Guide)
            </a>
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

        <div>
          <label
            htmlFor='notes'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.notes && 'text-red-600'
            )}
          >
            Notes
          </label>
          <Controller
            name='notes'
            control={control}
            render={({ field }) => <MarkdownEditor id='notes' {...field} />}
          />
          {errors.notes && (
            <div className='text-sm text-red-600'>{errors.notes.message}</div>
          )}
        </div>
      </div>

      <div className='flex p-1 space-x-1 border-t'>
        <ButtonPrimary type='submit' className='flex-1'>
          Submit
        </ButtonPrimary>
        <ButtonTertiary
          type='button'
          className='flex-1'
          onClick={() => onClose()}
        >
          Cancel
        </ButtonTertiary>
      </div>
    </form>
  )
}

export default GenreForm
