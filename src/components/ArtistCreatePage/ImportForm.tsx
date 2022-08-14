import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { spotifyArtistRegex } from '../../server/services/spotify/regex'
import { ArtistObject } from '../../server/services/spotify/types'
import { useSpotifyArtistQuery } from '../../services/spotify'
import { ButtonPrimary } from '../common/Button'

type ImportFormFields = {
  url: string
}

const ImportForm: FC<{ onData: (data: ArtistObject) => void }> = ({
  onData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
    setError,
  } = useForm<ImportFormFields>()

  useEffect(() => setFocus('url'), [setFocus])

  const [spotifyId, setSpotifyId] = useState('')

  const onSubmit = useCallback(
    (data: ImportFormFields) => {
      let id: string | null = null
      if (data.url.length > 0) {
        const match = spotifyArtistRegex.exec(data.url)
        if (match === null) {
          setError('url', {
            message: 'Not a valid Spotify URL',
            type: 'validate',
          })
          return
        }

        id = match[1]
      }

      if (id) {
        setSpotifyId(id)
      }
    },
    [setError]
  )

  const artistQuery = useSpotifyArtistQuery(spotifyId)

  useEffect(() => {
    if (artistQuery.data) {
      onData(artistQuery.data)
    }
  }, [artistQuery.data, onData])

  return (
    <form
      className='flex items-center space-x-1'
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
    >
      <div>
        <label htmlFor='url' className='hidden'>
          URL
        </label>
        <input
          id='url'
          placeholder='URL'
          autoComplete='off'
          className={clsx(
            'border rounded-sm p-1 px-2',
            errors.url && 'border-red-600 outline-red-600'
          )}
          {...register('url', { required: 'URL is required' })}
        />
        {errors.url && (
          <div className='text-sm text-red-600'>{errors.url.message}</div>
        )}
      </div>

      <ButtonPrimary type='submit' disabled={artistQuery.isLoading}>
        {artistQuery.isLoading ? 'Importing...' : 'Import'}
      </ButtonPrimary>
    </form>
  )
}

export default ImportForm
