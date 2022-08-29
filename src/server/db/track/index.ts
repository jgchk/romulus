import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { createArtist } from '../artist'
import { addTrackHistory } from '../track-history'
import { CreateTrackInput, EditTrackInput } from './input'
import { DefaultTrack, defaultTrackSelect } from './output'

export const getTracks = () =>
  prisma.track.findMany({ select: defaultTrackSelect })

export const getTrack = (id: number) =>
  prisma.track.findUnique({ where: { id }, select: defaultTrackSelect })

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

export const editTrack = async (
  { id, data }: EditTrackInput,
  accountId: number
): Promise<DefaultTrack> => {
  const artists = data.artists
    ? await Promise.all(
        data.artists.map(async (artistInput) => {
          if (artistInput.type === 'existing') {
            return artistInput.id
          } else {
            const artist = await createArtist(artistInput.data, accountId)
            return artist.id
          }
        })
      )
    : undefined

  const track = await prisma.track.update({
    where: { id },
    data: {
      ...data,
      artists: artists
        ? {
            deleteMany: {},
            create: artists.map((artistId, i) => ({ artistId, order: i })),
          }
        : undefined,
    },
    select: defaultTrackSelect,
  })

  await addTrackHistory(track, CrudOperation.UPDATE, accountId)

  return track
}

export const deleteTrack = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const track = await prisma.track.findUnique({
    where: { id },
    select: defaultTrackSelect,
  })

  if (!track) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No track with id '${id}'`,
    })
  }

  await addTrackHistory(track, CrudOperation.DELETE, accountId)

  return { id }
}
