import { Permission } from '@prisma/client'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import { spotifyAlbumRegex } from '../../server/services/spotify/regex'
import { AlbumObject } from '../../server/services/spotify/types'
import { useSession } from '../../services/auth'
import { check, iso8601 } from '../../utils/validators'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'

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
    handleSubmit,
    control,
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
        <InputGroup id='title' label='Title' error={errors.title}>
          <Controller
            name='title'
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

        <InputGroup
          id='release-date'
          label='Release Date'
          error={errors.releaseDate}
        >
          <Controller
            name='releaseDate'
            control={control}
            rules={{
              validate: (value) =>
                value.length === 0 ||
                check(iso8601(), value) ||
                'Must be a validate date',
            }}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

        <InputGroup
          id='spotify-url'
          label='Spotify URL'
          error={errors.spotifyUrl}
        >
          <Controller
            name='spotifyUrl'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>
      </div>

      {session.isLoggedIn && session.hasPermission(Permission.EDIT_RELEASES) && (
        <Button className='mt-3' type='submit' loading={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create'}
        </Button>
      )}
    </form>
  )
}

export default ReleaseForm
