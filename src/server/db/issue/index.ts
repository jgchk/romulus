import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { createArtist } from '../artist'
import { addIssueHistory } from '../issue-history'
import { createObject } from '../object'
import { CreateIssueInput, EditIssueInput } from './input'
import { DefaultIssue, defaultIssueSelect } from './output'

export const createIssue = async (
  input: CreateIssueInput,
  accountId: number
): Promise<DefaultIssue> => {
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

  const objects = await Promise.all(
    input.objects.map(async (objectInput) => {
      if (objectInput.type === 'existing') {
        return objectInput.id
      } else {
        const object = await createObject(objectInput.data, accountId)
        return object.id
      }
    })
  )

  const issue = await prisma.issue.create({
    data: {
      ...input,
      artists: {
        create: artists.map((artistId, i) => ({ artistId, order: i })),
      },
      objects: {
        create: objects.map((objectId, i) => ({ objectId, order: i })),
      },
    },
    select: defaultIssueSelect,
  })

  await addIssueHistory(issue, CrudOperation.CREATE, accountId)

  return issue
}

export const editIssue = async (
  { id, data }: EditIssueInput,
  accountId: number
): Promise<DefaultIssue> => {
  const issue = await prisma.issue.update({
    where: { id },
    data: {
      ...data,
      artists: data.artists
        ? {
            // TODO: verify if this works
            disconnect: {},
            create: data.artists.map((id, i) => ({ artistId: id, order: i })),
          }
        : undefined,
    },
    select: defaultIssueSelect,
  })

  await addIssueHistory(issue, CrudOperation.UPDATE, accountId)

  return issue
}

export const deleteIssue = async (
  id: number,
  accountId: number
): Promise<{ id: number }> => {
  const issue = await prisma.issue.findUnique({
    where: { id },
    select: defaultIssueSelect,
  })
  if (!issue) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No issue with id '${id}'`,
    })
  }

  await prisma.issue.delete({ where: { id } })

  await addIssueHistory(issue, CrudOperation.DELETE, accountId)

  return { id }
}
