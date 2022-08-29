import { CrudOperation, Track, TrackArtist } from '@prisma/client'

import { prisma } from '../../prisma'

export const addTrackHistory = (
  track: Omit<Track, 'createdAt' | 'updatedAt'> & {
    artists: Omit<TrackArtist, 'trackId'>[]
  },
  operation: CrudOperation,
  accountId: number
) =>
  prisma.trackHistory.create({
    data: {
      title: track.title,
      durationMs: track.durationMs,
      artists: {
        create: track.artists.map((artist) => ({
          artistId: artist.artistId,
          order: artist.order,
        })),
      },

      trackId: track.id,
      operation,
      accountId,
    },
  })
