import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateSongInput, EditSongInput } from './inputs'
import { defaultSongSelect } from './outputs'

export const getSongs = () =>
  prisma.song.findMany({ select: defaultSongSelect })

export const getSong = async (id: number) => {
  const song = await prisma.song.findUnique({
    where: { id },
    select: defaultSongSelect,
  })

  if (!song) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No song with id '${id}'`,
    })
  }

  return song
}

export const createSong = async (input: CreateSongInput) => {
  const song = await prisma.song.create({
    data: input,
    select: defaultSongSelect,
  })

  // TODO: song history

  return song
}

export const editSong = async ({ id, data }: EditSongInput) => {
  const song = await prisma.song.update({
    where: { id },
    data,
    select: defaultSongSelect,
  })

  // TODO: song history

  return song
}

export const deleteSong = async (id: number) => {
  await prisma.song.delete({ where: { id } })

  // TODO: song history

  return { id }
}
