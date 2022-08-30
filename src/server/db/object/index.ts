import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { addObjectHistory } from '../object-history'
import { createTrack } from '../track'
import { CreateObjectInput, EditObjectInput } from './input'
import { DefaultObject, defaultObjectSelect } from './output'

export const getObjects = () =>
  prisma.object.findMany({ select: defaultObjectSelect })

export const getObject = (id: number) =>
  prisma.object.findUnique({ where: { id }, select: defaultObjectSelect })

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

export const editObject = async (
  { id, data }: EditObjectInput,
  accountId: number
): Promise<DefaultObject> => {
  const tracks = data.tracks
    ? await Promise.all(
        data.tracks.map(async (trackInput) => {
          if (trackInput.type === 'existing') {
            return trackInput.id
          } else {
            const track = await createTrack(trackInput.data, accountId)
            return track.id
          }
        })
      )
    : undefined

  const object = await prisma.object.update({
    where: { id },
    data: {
      ...data,
      tracks: tracks
        ? {
            deleteMany: {},
            create: tracks.map((trackId, i) => ({ trackId, order: i })),
          }
        : undefined,
    },
    select: defaultObjectSelect,
  })

  await addObjectHistory(object, CrudOperation.UPDATE, accountId)

  return object
}

export const deleteObject = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const object = await prisma.object.findUnique({
    where: { id },
    select: defaultObjectSelect,
  })

  if (!object) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No object with id '${id}'`,
    })
  }

  await prisma.object.delete({ where: { id } })

  await addObjectHistory(object, CrudOperation.DELETE, accountId)

  return { id }
}
