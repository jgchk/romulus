import { Permission } from '@prisma/client'
import clsx from 'clsx'
import { FC, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import { spotifyArtistRegex } from '../../server/services/spotify/regex'
import { ArtistObject } from '../../server/services/spotify/types'
import { useSession } from '../../services/auth'
import { ButtonPrimary } from '../common/Button'
import Loader from '../common/Loader'

type ArtistFormFields = {
  name: string
  akas: string
  spotifyUrls: string
}

export type ArtistFormData = {
  name: string
  akas: string[]
  spotifyIds: string[]
}

const ArtistForm: FC<{
  importData?: ArtistObject
  onSubmit: (data: ArtistFormData) => void
  isSubmitting?: boolean
  isSubmitted?: boolean
}> = ({ importData, onSubmit, isSubmitting, isSubmitted }) => {
  const session = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    getValues,
    setValue,
    setError,
  } = useForm<ArtistFormFields>()

  useEffect(() => {
    if (!importData) return

    if (getValues('name').length === 0) {
      setValue('name', importData.name)
    }

    if (getValues('spotifyUrls').length === 0) {
      setValue('spotifyUrls', importData.external_urls.spotify)
    }
  }, [getValues, importData, setValue])

  const submitHandler = useCallback(
    (data: ArtistFormFields) => {
      const spotifyIds: string[] = []
      for (const spotifyUrl of data.spotifyUrls
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)) {
        const match = spotifyArtistRegex.exec(spotifyUrl)
        if (match === null) {
          setError('spotifyUrls', {
            message: 'Not a valid Spotify artist URL',
            type: 'validate',
          })
          return
        }
        spotifyIds.push(match[1])
      }

      onSubmit({
        name: data.name,
        akas: data.akas
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        spotifyIds,
      })
    },
    [onSubmit, setError]
  )

  useWarnOnUnsavedChanges({ dirtyFields, isSubmitted, isSubmitting })

  return (
    <form onSubmit={(e) => void handleSubmit(submitHandler)(e)}>
      <div className='space-y-3'>
        <div>
          <label
            htmlFor='name'
            className={clsx(
              'block text-sm',
              errors.name ? 'text-red-600' : 'text-gray-700'
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
          {errors.akas && (
            <div className='text-sm text-red-600'>{errors.akas.message}</div>
          )}
        </div>

        <div>
          <label
            htmlFor='spotify-urls'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.spotifyUrls && 'text-red-600'
            )}
          >
            Spotify URLs
          </label>
          <input
            id='spotify-urls'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.spotifyUrls && 'border-red-600 outline-red-600'
            )}
            {...register('spotifyUrls')}
          />
          {errors.spotifyUrls && (
            <div className='text-sm text-red-600'>
              {errors.spotifyUrls.message}
            </div>
          )}
        </div>
      </div>

      {session.isLoggedIn &&
        session.hasPermission(Permission.EDIT_ARTISTS) &&
        (isSubmitting ? (
          <ButtonPrimary className='mt-3' type='submit' disabled>
            <Loader className='text-white' size={16} />
            <div>Creating...</div>
          </ButtonPrimary>
        ) : (
          <ButtonPrimary className='mt-3' type='submit'>
            Create
          </ButtonPrimary>
        ))}
    </form>
  )
}

export default ArtistForm
