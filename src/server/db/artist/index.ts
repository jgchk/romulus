import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateArtistInput, EditArtistInput } from './inputs'
import { defaultArtistSelect } from './outputs'

export const getArtists = () =>
  prisma.artist.findMany({ select: defaultArtistSelect })

export const getArtist = async (id: number) => {
  const artist = await prisma.artist.findUnique({
    where: { id },
    select: defaultArtistSelect,
  })

  if (!artist) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No artist with id '${id}'`,
    })
  }

  return artist
}

export const createArtist = async (input: CreateArtistInput) => {
  const artist = await prisma.artist.create({
    data: {
      name: input.name,
      members: input.members
        ? {
            create: input.members.map((member) => ({
              personId: member.personId,
              name: member.name,
            })),
          }
        : undefined,
    },
    select: defaultArtistSelect,
  })

  // TODO: artist history

  return artist
}

export const editArtist = async ({ id, data }: EditArtistInput) => {
  const artist = await prisma.artist.update({
    where: { id },
    data: {
      name: data.name,
      members: data.members
        ? {
            deleteMany: {},
            create: data.members.map((member) => ({
              personId: member.personId,
              name: member.name,
            })),
          }
        : undefined,
    },
    select: defaultArtistSelect,
  })

  // TODO: artist history

  return artist
}

export const deleteArtist = async (id: number) => {
  await prisma.artist.delete({ where: { id } })

  // TODO: artist history

  return { id }
}
