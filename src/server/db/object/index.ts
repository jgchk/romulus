import { CrudOperation } from '@prisma/client'

import { prisma } from '../../prisma'
import { addObjectHistory } from '../object-history'
import { createTrack } from '../track'
import { CreateObjectInput } from './input'
import { DefaultObject, defaultObjectSelect } from './output'

export const createObject = async (
  input: CreateObjectInput,
  accountId: number
): Promise<DefaultObject> => {
  const tracks = await Promise.all(
    input.tracks.map(async (trackInput) => {
      if (trackInput.type === 'existing') {
        return trackInput.id
      } else {
        const track = await createTrack(trackInput.data, accountId)
        return track.id
      }
    })
  )

  const object = await prisma.object.create({
    data: {
      ...input,
      tracks: { create: tracks.map((trackId, i) => ({ trackId, order: i })) },
    },
    select: defaultObjectSelect,
  })

  await addObjectHistory(object, CrudOperation.CREATE, accountId)

  return object
}
