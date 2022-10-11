import { GenreAka, GenreType, Permission } from '@prisma/client'
import { useMemo } from 'react'
import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../../../hooks/useWarnOnUnsavedChanges'
import { GenreAkaInput } from '../../../../server/db/genre/inputs'
import { DefaultGenre } from '../../../../server/db/genre/outputs'
import { useSession } from '../../../../services/auth'
import { capitalize } from '../../../../utils/string'
import { ifDefined } from '../../../../utils/types'
import Button from '../../../common/Button'
import Input from '../../../common/Input'
import InputGroup from '../../../common/InputGroup'
import RomcodeEditor from '../../../common/Romcode/Editor'
import Select from '../../../common/Select'
import RelevanceSelect from '../../RelevanceSelect'
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

  const [isConfirming, setConfirming] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    setFocus,
  } = useForm<GenreFormFields>({
    defaultValues: {
      name: genre?.name ?? '',
      subtitle: genre?.subtitle ?? '',
      type: genre?.type ?? 'STYLE',
      primaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 3)) ?? '',
      secondaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 2)) ?? '',
      tertiaryAkas: ifDefined(genre?.akas, (akas) => joinAkas(akas, 1)) ?? '',
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

  const typeOptions = useMemo(
    () =>
      Object.values(GenreType).map((type) => ({
        key: type,
        label: capitalize(type),
      })),
    []
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

  const renderButtons = useCallback(() => {
    const CancelButton = (
      <Button
        template='tertiary'
        type='button'
        className='flex-1'
        onClick={() => onClose()}
      >
        Cancel
      </Button>
    )

    const SubmitButton = (
      <Button type='submit' className='flex-1' loading={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    )

    if (!session.isLoggedIn && session.hasPermission(Permission.EDIT_GENRES)) {
      return <div className='flex space-x-1 border-t p-1'>{CancelButton}</div>
    }

    // confirm when submitting top-level genres
    if (parentGenres.length === 0) {
      return isConfirming ? (
        <div className='border-t'>
          <div className='mt-1 flex justify-center text-gray-800'>
            <span>
              You are submitting a <b>top-level genre</b>. Are you sure?
            </span>
          </div>
          <div className='flex space-x-1 p-1'>
            <Button
              template='tertiary'
              type='button'
              className='flex-1'
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            {SubmitButton}
          </div>
        </div>
      ) : (
        <div className='flex space-x-1 border-t p-1'>
          <Button
            type='button'
            className='flex-1'
            onClick={() => setConfirming(true)}
          >
            Submit
          </Button>
          {CancelButton}
        </div>
      )
    }

    return (
      <div className='flex space-x-1 border-t p-1'>
        {SubmitButton}
        {CancelButton}
      </div>
    )
  }, [isConfirming, isSubmitting, onClose, parentGenres.length, session])

  return (
    <form
      onSubmit={(e) => void handleSubmit(submitHandler)(e)}
      className='flex h-full flex-col'
    >
      <div className='w-full flex-1 space-y-3 overflow-auto p-4'>
        <InputGroup id='name' label='Name' error={errors.name}>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

        <InputGroup id='subtitle' label='Subtitle' error={errors.subtitle}>
          <Controller
            name='subtitle'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

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
            <InputGroup
              id='primary-akas'
              label='Primary'
              error={errors.primaryAkas}
            >
              <Controller
                name='primaryAkas'
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </InputGroup>
            <InputGroup
              id='secondary-akas'
              label='Secondary'
              error={errors.primaryAkas}
            >
              <Controller
                name='secondaryAkas'
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </InputGroup>
            <InputGroup
              id='tertiary-akas'
              label='Tertiary'
              error={errors.tertiaryAkas}
            >
              <Controller
                name='tertiaryAkas'
                control={control}
                render={({ field }) => <Input {...field} />}
              />
            </InputGroup>
          </div>
        </fieldset>

        <InputGroup id='type' label='Type' error={errors.type}>
          <Controller
            name='type'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={typeOptions}
                value={typeOptions.find((to) => to.key === field.value)}
                onChange={(v) => field.onChange(v.key)}
              />
            )}
          />
        </InputGroup>

        <InputGroup
          id='relevance'
          label={
            <>
              Relevance{' '}
              <a
                href='https://discord.com/channels/940459362168746055/1008898978911375384/1008900089936351252'
                target='_blank'
                rel='noreferrer'
                className='text-xs text-primary-500 hover:underline'
              >
                (More Info)
              </a>
            </>
          }
          error={errors.relevance}
        >
          <Controller
            name='relevance'
            control={control}
            render={({ field }) => <RelevanceSelect {...field} />}
          />
        </InputGroup>

        <InputGroup id='parents' label='Parents'>
          <GenreMultiselect
            excludeIds={[
              ...(genre !== undefined ? [genre.id] : []),
              ...(genre?.childGenres.map(({ id }) => id) ?? []),
            ]}
            selectedIds={parentGenres}
            onChange={(g) => setParentGenres(g)}
          />
        </InputGroup>

        <InputGroup id='influences' label='Influences'>
          <GenreMultiselect
            excludeIds={genre !== undefined ? [genre.id] : []}
            selectedIds={influencedByGenres}
            onChange={(g) => setInfluencedByGenres(g)}
          />
        </InputGroup>

        <InputGroup
          id='short-description'
          label='Short Description'
          error={errors.shortDescription}
        >
          <Controller
            name='shortDescription'
            control={control}
            render={({ field }) => (
              <RomcodeEditor id='short-description' {...field} />
            )}
          />
        </InputGroup>

        <InputGroup
          id='long-description'
          label='Long Description'
          error={errors.longDescription}
        >
          <Controller
            name='longDescription'
            control={control}
            render={({ field }) => (
              <RomcodeEditor id='long-description' {...field} />
            )}
          />
        </InputGroup>

        <InputGroup id='notes' label='Notes' error={errors.notes}>
          <Controller
            name='notes'
            control={control}
            render={({ field }) => <RomcodeEditor id='notes' {...field} />}
          />
        </InputGroup>
      </div>

      {renderButtons()}
    </form>
  )
}

export default GenreForm
