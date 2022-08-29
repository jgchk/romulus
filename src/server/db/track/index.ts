import { CrudOperation } from '@prisma/client'

import { prisma } from '../../prisma'
import { createArtist } from '../artist'
import { addTrackHistory } from '../track-history'
import { CreateTrackInput } from './input'
import { DefaultTrack, defaultTrackSelect } from './output'

export const createTrack = async (
  input: CreateTrackInput,
  accountId: number
): Promise<DefaultTrack> => {
  const artists = await Promise.all(
    input.artists.map(async (artistInput) => {
      if (artistInput.type === 'existing') {
        return artistInput.id
      } else {
        const artist = await createArtist(artistInput.data, accountId)
        return artist.id
      }
    })
  )

  const track = await prisma.track.create({
    data: {
      ...input,
      artists: {
        create: artists.map((artistId, i) => ({ artistId, order: i })),
      },
    },
    select: defaultTrackSelect,
  })

  await addTrackHistory(track, CrudOperation.CREATE, accountId)

  return track
}
