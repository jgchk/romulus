import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateReleaseTypeInput } from './inputs'
import { defaultReleaseTypeSelect } from './outputs'

export const getReleaseTypes = () =>
  prisma.releaseType.findMany({ select: defaultReleaseTypeSelect })

export const getReleaseType = async (id: number) => {
  const releaseType = await prisma.releaseType.findUnique({
    where: { id },
    select: defaultReleaseTypeSelect,
  })

  if (!releaseType) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No release type with id '${id}'`,
    })
  }

  return releaseType
}

export const createReleaseType = async (input: CreateReleaseTypeInput) => {
  const releaseType = await prisma.releaseType.create({
    data: {
      mediaTypes: { connect: input.mediaTypes.map((id) => ({ id })) },
      schemaObject: {
        create: {
          name: input.schema.name,
          fields: {
            create: input.schema.fields.map((field) => ({
              name: field.name,
              type: field.type,
              array: field.array,
              nullable: field.nullable,
            })),
          },
        },
      },
    },
    select: defaultReleaseTypeSelect,
  })

  // TODO: release type history

  return releaseType
}

export const deleteReleaseType = async (id: number) => {
  await prisma.releaseType.delete({ where: { id } })

  // TODO: release type history

  return { id }
}
