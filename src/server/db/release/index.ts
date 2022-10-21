import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateReleaseInput, EditReleaseInput } from './inputs'
import { defaultReleaseSelect } from './outputs'

export const getReleases = () =>
  prisma.release.findMany({ select: defaultReleaseSelect })

export const getRelease = async (id: number) => {
  const release = await prisma.release.findUnique({
    where: { id },
    select: defaultReleaseSelect,
  })

  if (!release) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No release with id '${id}'`,
    })
  }

  return release
}

export const createRelease = async (input: CreateReleaseInput) => {
  const release = await prisma.release.create({
    data: {
      typeId: input.typeId,
      songs: { connect: input.songIds.map((id) => ({ id })) },
    },
    select: defaultReleaseSelect,
  })

  // TODO: release history

  return release
}

export const editRelease = async ({ id, data }: EditReleaseInput) => {
  const release = await prisma.release.update({
    where: { id },
    data: {
      typeId: data.typeId,
      songs: data.songIds
        ? { set: data.songIds.map((id) => ({ id })) }
        : undefined,
    },
    select: defaultReleaseSelect,
  })

  // TODO: release history

  return release
}

export const deleteRelease = async (id: number) => {
  await prisma.release.delete({ where: { id } })

  // TODO: release history

  return { id }
}
