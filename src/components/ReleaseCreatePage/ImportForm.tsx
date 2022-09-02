import clsx from 'clsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { spotifyAlbumRegex } from '../../server/services/spotify/regex'
import { AlbumObject } from '../../server/services/spotify/types'
import { useSpotifyAlbumQuery } from '../../services/spotify'
import Button from '../common/Button'
import Label from '../common/Label'

type ImportFormFields = {
  url: string
}

const ImportForm: FC<{ onData: (data: AlbumObject) => void }> = ({
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
        const match = spotifyAlbumRegex.exec(data.url)
        if (match === null) {
          setError('url', {
            message: 'Not a valid Spotify album URL',
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

  const albumQuery = useSpotifyAlbumQuery(spotifyId)

  useEffect(() => {
    if (albumQuery.data) {
      onData(albumQuery.data)
    }
  }, [albumQuery.data, onData])

  return (
    <form
      className='flex items-center space-x-1'
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
    >
      <div>
        <Label htmlFor='url' className='hidden'>
          URL
        </Label>
        <input
          id='url'
          placeholder='URL'
          autoComplete='off'
          className={clsx(
            'mt-0.5 rounded-sm border p-1 px-2',
            errors.url && 'border-error-600 outline-error-600'
          )}
          {...register('url', { required: 'URL is required' })}
        />
        {errors.url && (
          <div className='text-sm text-error-600'>{errors.url.message}</div>
        )}
      </div>

      <Button type='submit' loading={albumQuery.isLoading}>
        {albumQuery.isLoading ? 'Importing...' : 'Import'}
      </Button>
    </form>
  )
}

export default ImportForm
