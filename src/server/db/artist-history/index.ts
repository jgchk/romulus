import { Artist, CrudOperation } from '@prisma/client'

import { prisma } from '../../prisma'

export const addArtistHistory = (
  artist: Omit<Artist, 'createdAt' | 'updatedAt'>,
  operation: CrudOperation,
  accountId: number
) =>
  prisma.artistHistory.create({
    data: {
      name: artist.name,
      akas: artist.akas,
      spotifyIds: artist.spotifyIds,
      artistId: artist.id,
      operation,
      accountId,
    },
  })
