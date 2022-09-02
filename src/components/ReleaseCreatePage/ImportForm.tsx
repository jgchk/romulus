import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { spotifyAlbumRegex } from '../../server/services/spotify/regex'
import { AlbumObject } from '../../server/services/spotify/types'
import { useSpotifyAlbumQuery } from '../../services/spotify'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'

type ImportFormFields = {
  url: string
}

const ImportForm: FC<{ onData: (data: AlbumObject) => void }> = ({
  onData,
}) => {
  const {
    handleSubmit,
    control,
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
      <InputGroup id='url' label='URL' error={errors.url}>
        <Controller
          name='url'
          control={control}
          rules={{ required: 'URL is required' }}
          render={({ field }) => (
            <Input type='url' autoComplete='off' {...field} />
          )}
        />
      </InputGroup>

      <Button type='submit' loading={albumQuery.isLoading}>
        {albumQuery.isLoading ? 'Importing...' : 'Import'}
      </Button>
    </form>
  )
}

export default ImportForm
