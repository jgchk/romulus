import { FC, useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { spotifyArtistRegex } from '../../server/services/spotify/regex'
import { ArtistObject } from '../../server/services/spotify/types'
import { useSpotifyArtistQuery } from '../../services/spotify'
import Button from '../common/Button'
import Input from '../common/Input'
import InputGroup from '../common/InputGroup'

type ImportFormFields = {
  url: string
}

const ImportForm: FC<{ onData: (data: ArtistObject) => void }> = ({
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

      <Button type='submit' loading={artistQuery.isLoading}>
        {artistQuery.isLoading ? 'Importing...' : 'Import'}
      </Button>
    </form>
  )
}

export default ImportForm
