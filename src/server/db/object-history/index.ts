import {
  CrudOperation,
  Object as ObjectType,
  ObjectTrack,
} from '@prisma/client'

import { prisma } from '../../prisma'

export const addObjectHistory = (
  object: Omit<ObjectType, 'createdAt' | 'updatedAt'> & {
    tracks: Omit<ObjectTrack, 'objectId'>[]
  },
  operation: CrudOperation,
  accountId: number
) =>
  prisma.objectHistory.create({
    data: {
      name: object.name,
      tracks: {
        create: object.tracks.map((track) => ({
          trackId: track.trackId,
          order: track.order,
        })),
      },

      objectId: object.id,
      operation,
      accountId,
    },
  })
