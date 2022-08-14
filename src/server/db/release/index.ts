import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { addReleaseHistory } from '../release-history'
import { CreateReleaseInput, EditReleaseInput } from './input'
import { DefaultRelease, defaultReleaseSelect } from './output'

export const createRelease = async (
  input: CreateReleaseInput,
  accountId: number
): Promise<DefaultRelease> => {
  const release = await prisma.release.create({
    data: input,
    select: defaultReleaseSelect,
  })

  await addReleaseHistory(release, CrudOperation.CREATE, accountId)

  return release
}

export const editRelease = async (
  { id, data }: EditReleaseInput,
  accountId: number
): Promise<DefaultRelease> => {
  const release = await prisma.release.update({
    where: { id },
    data,
    select: defaultReleaseSelect,
  })

  await addReleaseHistory(release, CrudOperation.UPDATE, accountId)

  return release
}

export const deleteRelease = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const release = await prisma.release.findUnique({ where: { id } })
  if (!release) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No release with id '${id}'`,
    })
  }

  await prisma.release.delete({ where: { id } })

  await addReleaseHistory(release, CrudOperation.DELETE, accountId)

  return { id }
}
