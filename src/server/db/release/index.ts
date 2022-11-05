import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateReleaseInput, EditReleaseInput } from './inputs'
import { defaultReleaseSelect } from './outputs'
import { makeTrackDbInput } from './utils'

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
    data: { ...input, tracks: { create: makeTrackDbInput(input.tracks) } },
    select: defaultReleaseSelect,
  })

  // TODO: release history

  return release
}

export const editRelease = async ({ id, data }: EditReleaseInput) => {
  const release = await prisma.release.update({
    where: { id },
    data: {
      ...data,
      tracks:
        data.tracks !== undefined
          ? { deleteMany: {}, create: makeTrackDbInput(data.tracks) }
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
