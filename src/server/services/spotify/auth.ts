import got from 'got'

import { env } from '../../env'
import { TokenResponse } from './types'

const client_id = env.SPOTIFY_ID
const client_secret = env.SPOTIFY_SECRET

export const requestToken = async (): Promise<TokenResponse> =>
  got
    .post('https://accounts.spotify.com/api/token', {
      form: { grant_type: 'client_credentials' },
      headers: {
        Authorization: `Basic ${Buffer.from(
          client_id + ':' + client_secret
        ).toString('base64')}`,
      },
    })
    .json<TokenResponse>()
