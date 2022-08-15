import { GenreType, Permission } from '@prisma/client'
import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import { DefaultGenre } from '../../server/db/genre/outputs'
import { useSession } from '../../services/auth'
import { ifDefined } from '../../utils/types'
import { ButtonPrimary, ButtonTertiary } from '../common/Button'
import Loader from '../common/Loader'
import MarkdownEditor from '../common/MarkdownEditor'
import GenreMultiselect from './GenreMultiselect'

const DEFAULT_RELEVANCE = 3

const GenreFormFields = {
  name: '',
  subtitle: '',
  type: GenreType.STYLE as GenreType,
  akas: '',
  shortDescription: '',
  longDescription: '',
  notes: '',
  relevance: DEFAULT_RELEVANCE,
}

export type GenreFormFields = typeof GenreFormFields

export const isGenreFormField = (t: string): t is keyof GenreFormFields =>
  t in GenreFormFields

export type GenreFormData = {
  name: string
  subtitle: string | null
  type: GenreType
  akas: string[]
  shortDescription: string | null
  longDescription: string | null
  notes: string | null
  parentGenres: number[]
  influencedByGenres: number[]
  relevance: number
}

const GenreForm: FC<{
  genre?: DefaultGenre
  onSubmit: (data: GenreFormData) => void
  onClose: () => void
  autoFocus?: keyof GenreFormFields
  isSubmitting?: boolean
  isSubmitted?: boolean
}> = ({ genre, onSubmit, onClose, autoFocus, isSubmitting, isSubmitted }) => {
  const session = useSession()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setFocus,
  } = useForm<GenreFormFields>({
    defaultValues: {
      name: genre?.name ?? '',
      subtitle: genre?.subtitle ?? '',
      type: genre?.type ?? 'STYLE',
      akas: ifDefined(genre?.akas, (akas) => akas.join(', ')),
      shortDescription: genre?.shortDescription ?? '',
      longDescription: genre?.longDescription ?? '',
      notes: genre?.notes ?? '',
      relevance: genre?.relevance ?? DEFAULT_RELEVANCE,
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
        subtitle: data.subtitle || null,
        type: data.type,
        akas: data.akas
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        shortDescription: data.shortDescription || null,
        longDescription: data.longDescription || null,
        notes: data.notes || null,
        parentGenres,
        influencedByGenres,
        relevance: data.relevance,
      }),
    [influencedByGenres, onSubmit, parentGenres]
  )

  useEffect(() => setFocus(autoFocus ?? 'name'), [autoFocus, setFocus])

  useWarnOnUnsavedChanges({ dirtyFields, isSubmitted, isSubmitting })

  return (
    <form
      onSubmit={(e) => void handleSubmit(submitHandler)(e)}
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
            htmlFor='subtitle'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.subtitle && 'text-red-600'
            )}
          >
            Subtitle
          </label>
          <input
            id='subtitle'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.subtitle && 'border-red-600 outline-red-600'
            )}
            {...register('subtitle')}
          />
          {errors.subtitle && (
            <div className='text-sm text-red-600'>
              {errors.subtitle.message}
            </div>
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
          {errors.akas && (
            <div className='text-sm text-red-600'>{errors.akas.message}</div>
          )}
        </div>

        <div>
          <label
            htmlFor='type'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.type && 'text-red-600'
            )}
          >
            Type
          </label>
          <select
            id='type'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5 capitalize',
              errors.type && 'border-red-600 outline-red-600'
            )}
            {...register('type')}
          >
            {Object.values(GenreType).map((type) => (
              <option key={type} value={type}>
                {type.toLowerCase()}
              </option>
            ))}
          </select>
          {errors.type && (
            <div className='text-sm text-red-600'>{errors.type.message}</div>
          )}
        </div>

        <div>
          <label
            htmlFor='relevance'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.relevance && 'text-red-600'
            )}
          >
            Relevance{' '}
            <a
              href='https://discord.com/channels/940459362168746055/940459362797879318/1008571200609468576'
              target='_blank'
              rel='noreferrer'
              className='text-blue-500 hover:underline text-xs'
            >
              (More Info)
            </a>
          </label>
          <select
            id='relevance'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5 capitalize',
              errors.relevance && 'border-red-600 outline-red-600'
            )}
            {...register('relevance', {
              setValueAs: (value: string) => Number.parseInt(value),
            })}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={99} disabled className='hidden'>
              Unset
            </option>
          </select>
          {errors.relevance && (
            <div className='text-sm text-red-600'>
              {errors.relevance.message}
            </div>
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
        {session.isLoggedIn &&
          session.hasPermission(Permission.EDIT_GENRES) &&
          (isSubmitting ? (
            <ButtonPrimary
              type='submit'
              className='flex-1 flex items-center justify-center space-x-2'
              disabled
            >
              <Loader className='text-white' size={16} />
              <div>Submitting...</div>
            </ButtonPrimary>
          ) : (
            <ButtonPrimary type='submit' className='flex-1'>
              Submit
            </ButtonPrimary>
          ))}
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
