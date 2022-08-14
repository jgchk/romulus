import got from 'got'

import { requestToken } from './auth'
import { AlbumObject, ArtistObject } from './types'

export const getAlbum = async (id: string) => {
  const { access_token } = await requestToken()
  return got
    .get(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    .json<AlbumObject>()
}

export const getArtist = async (id: string) => {
  const { access_token } = await requestToken()
  return got
    .get(`https://api.spotify.com/v1/artists/${id}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    .json<ArtistObject>()
}
