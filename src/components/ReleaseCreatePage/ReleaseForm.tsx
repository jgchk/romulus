import { Permission } from '@prisma/client'
import clsx from 'clsx'
import { FC, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import { spotifyAlbumRegex } from '../../server/services/spotify/regex'
import { AlbumObject } from '../../server/services/spotify/types'
import { useSession } from '../../services/auth'
import { check, iso8601 } from '../../utils/validators'
import { ButtonPrimary } from '../common/Button'

type ReleaseFormFields = {
  title: string
  releaseDate: string
  spotifyUrl: string
}

export type ReleaseFormData = {
  title: string
  //   artists: number[]
  releaseDate: string | null
  spotifyId: string | null
}

const ReleaseForm: FC<{
  importData?: AlbumObject
  onSubmit: (data: ReleaseFormData) => void
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
  } = useForm<ReleaseFormFields>()

  useEffect(() => {
    if (!importData) return

    if (getValues('title').length === 0) {
      setValue('title', importData.name)
    }

    if (getValues('spotifyUrl').length === 0) {
      setValue('spotifyUrl', importData.external_urls.spotify)
    }
  }, [getValues, importData, setValue])

  const submitHandler = useCallback(
    (data: ReleaseFormFields) => {
      let spotifyId: string | null = null
      if (data.spotifyUrl.length > 0) {
        const match = spotifyAlbumRegex.exec(data.spotifyUrl)
        if (match === null) {
          setError('spotifyUrl', {
            message: 'Not a valid Spotify album URL',
            type: 'validate',
          })
          return
        }

        spotifyId = match[1]
      }

      onSubmit({
        title: data.title,
        releaseDate: data.releaseDate || null,
        spotifyId,
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
            htmlFor='title'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.title && 'text-red-600'
            )}
          >
            Title
          </label>
          <input
            id='title'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.title && 'border-red-600 outline-red-600'
            )}
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <div className='text-sm text-red-600'>{errors.title.message}</div>
          )}
        </div>

        <div>
          <label
            htmlFor='release-date'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.releaseDate && 'text-red-600'
            )}
          >
            Release Date
          </label>
          <input
            id='release-date'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.releaseDate && 'border-red-600 outline-red-600'
            )}
            {...register('releaseDate', {
              validate: (value) =>
                check(iso8601(), value) || 'Must be a validate date',
            })}
          />
          {errors.releaseDate && (
            <div className='text-sm text-red-600'>
              {errors.releaseDate.message}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor='spotify-url'
            className={clsx(
              'block text-gray-700 text-sm',
              errors.spotifyUrl && 'text-red-600'
            )}
          >
            Spotify URL
          </label>
          <input
            id='spotify-url'
            className={clsx(
              'border rounded-sm p-1 px-2 mt-0.5',
              errors.spotifyUrl && 'border-red-600 outline-red-600'
            )}
            {...register('spotifyUrl')}
          />
          {errors.spotifyUrl && (
            <div className='text-sm text-red-600'>
              {errors.spotifyUrl.message}
            </div>
          )}
        </div>
      </div>

      {session.isLoggedIn && session.hasPermission(Permission.EDIT_RELEASES) && (
        <ButtonPrimary
          className='mt-3'
          type='submit'
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </ButtonPrimary>
      )}
    </form>
  )
}

export default ReleaseForm
