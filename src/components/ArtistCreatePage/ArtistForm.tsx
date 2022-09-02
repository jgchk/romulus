import { Permission } from '@prisma/client'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'

import useWarnOnUnsavedChanges from '../../hooks/useWarnOnUnsavedChanges'
import { spotifyArtistRegex } from '../../server/services/spotify/regex'
import { ArtistObject } from '../../server/services/spotify/types'
import { useSession } from '../../services/auth'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'

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
    handleSubmit,
    control,
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
        <InputGroup id='name' label='Name' error={errors.name}>
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Name is required' }}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

        <InputGroup id='akas' label='AKAs' error={errors.akas}>
          <Controller
            name='akas'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>

        <InputGroup
          id='spotify-urls'
          label='Spotify URLs'
          error={errors.spotifyUrls}
        >
          <Controller
            name='spotifyUrls'
            control={control}
            render={({ field }) => <Input {...field} />}
          />
        </InputGroup>
      </div>

      {session.isLoggedIn && session.hasPermission(Permission.EDIT_ARTISTS) && (
        <Button className='mt-3' type='submit' loading={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create'}
          Creating...
        </Button>
      )}
    </form>
  )
}

export default ArtistForm
