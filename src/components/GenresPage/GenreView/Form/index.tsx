import { GenreAka, GenreType, Permission } from '@prisma/client'
import clsx from 'clsx'
import { range } from 'ramda'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../../../hooks/useWarnOnUnsavedChanges'
import {
  MAX_GENRE_RELEVANCE,
  MIN_GENRE_RELEVANCE,
} from '../../../../server/db/common/inputs'
import { GenreAkaInput } from '../../../../server/db/genre/inputs'
import { DefaultGenre } from '../../../../server/db/genre/outputs'
import { useSession } from '../../../../services/auth'
import { ifDefined } from '../../../../utils/types'
import Button from '../../../common/Button'
import Label from '../../../common/Label'
import RomcodeEditor from '../../../common/RomcodeEditor'
import { getGenreRelevanceText } from '../../utils'
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
      className='flex h-full flex-col'
    >
      <div className='w-full flex-1 space-y-3 overflow-auto p-4'>
        <div>
          <Label htmlFor='name' error={errors.name}>
            Name
          </Label>
          <input
            id='name'
            className={clsx(
              'mt-0.5 rounded-sm border p-1 px-2',
              errors.name && 'border-error-600 outline-error-600'
            )}
            {...register('name', { required: 'Name is required' })}
          />
          {errors.name && (
            <div className='text-sm text-error-600'>{errors.name.message}</div>
          )}
        </div>

        <div>
          <Label htmlFor='subtitle' error={errors.subtitle}>
            Subtitle
          </Label>
          <input
            id='subtitle'
            className={clsx(
              'mt-0.5 rounded-sm border p-1 px-2',
              errors.subtitle && 'border-error-600 outline-error-600'
            )}
            {...register('subtitle')}
          />
          {errors.subtitle && (
            <div className='text-sm text-error-600'>
              {errors.subtitle.message}
            </div>
          )}
        </div>

        <fieldset className='border border-solid p-3'>
          <legend className='text-sm text-gray-700'>
            AKAs{' '}
            <a
              href='https://discord.com/channels/940459362168746055/1008898978911375384/1008927823647473747'
              target='_blank'
              rel='noreferrer'
              className='text-xs text-primary-500 hover:underline'
            >
              (More Info)
            </a>
          </legend>

          <div className='w-full space-y-2'>
            <div className='w-full'>
              <Label htmlFor='primary-akas' error={errors.primaryAkas}>
                Primary
              </Label>
              <input
                id='primary-akas'
                className={clsx(
                  'mt-0.5 w-full rounded-sm border p-1 px-2',
                  errors.primaryAkas && 'border-error-600 outline-error-600'
                )}
                {...register('primaryAkas')}
              />
              {errors.primaryAkas && (
                <div className='text-sm text-error-600'>
                  {errors.primaryAkas.message}
                </div>
              )}
            </div>
            <div className='w-full'>
              <Label htmlFor='secondary-akas' error={errors.secondaryAkas}>
                Secondary
              </Label>
              <input
                id='secondary-akas'
                className={clsx(
                  'mt-0.5 w-full rounded-sm border p-1 px-2',
                  errors.secondaryAkas && 'border-error-600 outline-error-600'
                )}
                {...register('secondaryAkas')}
              />
              {errors.secondaryAkas && (
                <div className='text-sm text-error-600'>
                  {errors.secondaryAkas.message}
                </div>
              )}
            </div>
            <div className='w-full'>
              <Label htmlFor='tertiary-akas' error={errors.tertiaryAkas}>
                Tertiary
              </Label>
              <input
                id='tertiary-akas'
                className={clsx(
                  'mt-0.5 w-full rounded-sm border p-1 px-2',
                  errors.tertiaryAkas && 'border-error-600 outline-error-600'
                )}
                {...register('tertiaryAkas')}
              />
              {errors.tertiaryAkas && (
                <div className='text-sm text-error-600'>
                  {errors.tertiaryAkas.message}
                </div>
              )}
            </div>
          </div>
        </fieldset>

        <div>
          <Label htmlFor='type' error={errors.type}>
            Type
          </Label>
          <select
            id='type'
            className={clsx(
              'mt-0.5 rounded-sm border p-1 px-2 capitalize',
              errors.type && 'border-error-600 outline-error-600'
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
            <div className='text-sm text-error-600'>{errors.type.message}</div>
          )}
        </div>

        <div>
          <Label htmlFor='relevance' error={errors.relevance}>
            Relevance{' '}
            <a
              href='https://discord.com/channels/940459362168746055/1008898978911375384/1008900089936351252'
              target='_blank'
              rel='noreferrer'
              className='text-xs text-primary-500 hover:underline'
            >
              (More Info)
            </a>
          </Label>
          <select
            id='relevance'
            className={clsx(
              'mt-0.5 rounded-sm border p-1 px-2 capitalize',
              errors.relevance && 'border-error-600 outline-error-600'
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
            <option value={99}>Unset</option>
          </select>
          {errors.relevance && (
            <div className='text-sm text-error-600'>
              {errors.relevance.message}
            </div>
          )}
        </div>

        <div>
          <Label>Parents</Label>
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
          <Label>Influences</Label>
          <GenreMultiselect
            excludeIds={genre !== undefined ? [genre.id] : []}
            selectedIds={influencedByGenres}
            onChange={(g) => setInfluencedByGenres(g)}
          />
        </div>

        <div>
          <Label htmlFor='short-description' error={errors.shortDescription}>
            Short Description
          </Label>
          <Controller
            name='shortDescription'
            control={control}
            render={({ field }) => (
              <RomcodeEditor id='short-description' {...field} />
            )}
          />
          {errors.shortDescription && (
            <div className='text-sm text-error-600'>
              {errors.shortDescription.message}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='long-description' error={errors.longDescription}>
            Long Description
          </Label>
          <Controller
            name='longDescription'
            control={control}
            render={({ field }) => (
              <RomcodeEditor id='long-description' {...field} />
            )}
          />
          {errors.longDescription && (
            <div className='text-sm text-error-600'>
              {errors.longDescription.message}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='notes' error={errors.notes}>
            Notes
          </Label>
          <Controller
            name='notes'
            control={control}
            render={({ field }) => <RomcodeEditor id='notes' {...field} />}
          />
          {errors.notes && (
            <div className='text-sm text-error-600'>{errors.notes.message}</div>
          )}
        </div>
      </div>

      <div className='flex space-x-1 border-t p-1'>
        {session.isLoggedIn && session.hasPermission(Permission.EDIT_GENRES) && (
          <Button type='submit' className='flex-1' loading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        )}
        <Button
          template='tertiary'
          type='button'
          className='flex-1'
          onClick={() => onClose()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default GenreForm
