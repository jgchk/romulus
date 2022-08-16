import { GenreAka, GenreType, Permission } from '@prisma/client'
import clsx from 'clsx'
import { range } from 'ramda'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
} from '../../server/db/common/inputs'
import { GenreAkaInput } from '../../server/db/genre/inputs'
import { DefaultGenre } from '../../server/db/genre/outputs'
import { useSession } from '../../services/auth'
import { ifDefined } from '../../utils/types'
import { ButtonPrimary, ButtonTertiary } from '../common/Button'
import Loader from '../common/Loader'
import MarkdownEditor from '../common/MarkdownEditor'
import { getGenreRelevanceText } from './common'
import GenreMultiselect from './GenreMultiselect'

const DEFAULT_RELEVANCE = 4

const GenreFormFields = {
  name: '',
  subtitle: '',
  type: GenreType.STYLE as GenreType,
  primaryAkas: '',
  secondaryAkas: '',
  tertiaryAkas: '',
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
  akas: GenreAkaInput[]
  shortDescription: string | null
  longDescription: string | null
  notes: string | null
  parentGenres: number[]
  influencedByGenres: number[]
  relevance: number
}

const joinAkas = (akas: GenreAka[], relevance: number): string =>
  akas
    .filter((aka) => aka.relevance === relevance)
    .sort((a, b) => a.order - b.order)
    .map((aka) => aka.name)
    .join(', ')

const splitAkas = (akas: string, relevance: number): GenreAkaInput[] =>
  akas
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((aka, i) => ({ name: aka, relevance, order: i }))

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
      primaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 3)),
      secondaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 2)),
      tertiaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 1)),
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
        akas: [
          ...splitAkas(data.primaryAkas, 3),
          ...splitAkas(data.secondaryAkas, 2),
          ...splitAkas(data.tertiaryAkas, 1),
        ],
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

        <fieldset className='border border-solid p-3'>
          <legend className='text-gray-700 text-sm'>
            AKAs{' '}
            <a
              href='https://discord.com/channels/940459362168746055/1008898978911375384/1008927823647473747'
              target='_blank'
              rel='noreferrer'
              className='text-blue-500 hover:underline text-xs'
            >
              (More Info)
            </a>
          </legend>

          <div className='space-y-2 w-full'>
            <div className='w-full'>
              <label
                htmlFor='primary-akas'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.primaryAkas && 'text-red-600'
                )}
              >
                Primary
              </label>
              <input
                id='primary-akas'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5 w-full',
                  errors.primaryAkas && 'border-red-600 outline-red-600'
                )}
                {...register('primaryAkas')}
              />
              {errors.primaryAkas && (
                <div className='text-sm text-red-600'>
                  {errors.primaryAkas.message}
                </div>
              )}
            </div>
            <div className='w-full'>
              <label
                htmlFor='secondary-akas'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.secondaryAkas && 'text-red-600'
                )}
              >
                Secondary
              </label>
              <input
                id='secondary-akas'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5 w-full',
                  errors.secondaryAkas && 'border-red-600 outline-red-600'
                )}
                {...register('secondaryAkas')}
              />
              {errors.secondaryAkas && (
                <div className='text-sm text-red-600'>
                  {errors.secondaryAkas.message}
                </div>
              )}
            </div>
            <div className='w-full'>
              <label
                htmlFor='tertiary-akas'
                className={clsx(
                  'block text-gray-700 text-sm',
                  errors.tertiaryAkas && 'text-red-600'
                )}
              >
                Tertiary
              </label>
              <input
                id='tertiary-akas'
                className={clsx(
                  'border rounded-sm p-1 px-2 mt-0.5 w-full',
                  errors.tertiaryAkas && 'border-red-600 outline-red-600'
                )}
                {...register('tertiaryAkas')}
              />
              {errors.tertiaryAkas && (
                <div className='text-sm text-red-600'>
                  {errors.tertiaryAkas.message}
                </div>
              )}
            </div>
          </div>
        </fieldset>

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
              href='https://discord.com/channels/940459362168746055/1008898978911375384/1008900089936351252'
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
            {range(MIN_GENRE_RELEVANCE, MAX_GENRE_RELEVANCE + 1).map((r) => (
              <option key={r} value={r}>
                {r} - {getGenreRelevanceText(r)}
              </option>
            ))}
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
