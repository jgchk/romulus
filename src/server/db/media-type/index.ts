import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateMediaTypeInput } from './inputs'
import { defaultMediaTypeSelect } from './outputs'

export const getMediaTypes = async () =>
  prisma.mediaType.findMany({ select: defaultMediaTypeSelect })

export const getMediaType = async (id: number) => {
  const mediaType = await prisma.mediaType.findUnique({
    where: { id },
    select: defaultMediaTypeSelect,
  })

  if (!mediaType) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No media type with id '${id}'`,
    })
  }

  return mediaType
}

export const createMediaType = async (input: CreateMediaTypeInput) => {
  const mediaType = await prisma.mediaType.create({
    data: {
      ...input,
      parents: { connect: input.parents.map((id) => ({ id })) },
      coreSenses: { connect: input.coreSenses.map((id) => ({ id })) },
      auxSenses: { connect: input.auxSenses.map((id) => ({ id })) },
    },
    select: defaultMediaTypeSelect,
  })

  // TODO: media type history

  return mediaType
}
