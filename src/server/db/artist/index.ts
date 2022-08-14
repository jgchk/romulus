import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { addArtistHistory } from '../artist-history'
import { CreateArtistInput, EditArtistInput } from './input'
import { DefaultArtist, defaultArtistSelect } from './output'

export const createArtist = async (
  input: CreateArtistInput,
  accountId: number
): Promise<DefaultArtist> => {
  const artist = await prisma.artist.create({
    data: input,
    select: defaultArtistSelect,
  })

  await addArtistHistory(artist, CrudOperation.CREATE, accountId)

  return artist
}

export const editArtist = async (
  { id, data }: EditArtistInput,
  accountId: number
): Promise<DefaultArtist> => {
  const artist = await prisma.artist.update({
    where: { id },
    data,
    select: defaultArtistSelect,
  })

  await addArtistHistory(artist, CrudOperation.UPDATE, accountId)

  return artist
}

export const deleteArtist = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const artist = await prisma.artist.findUnique({ where: { id } })
  if (!artist) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No artist with id '${id}'`,
    })
  }

  await prisma.artist.delete({ where: { id } })

  await addArtistHistory(artist, CrudOperation.DELETE, accountId)

  return { id }
}
