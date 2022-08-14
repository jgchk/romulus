import { CrudOperation } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { addIssueHistory } from '../issue-history'
import { CreateIssueInput, EditIssueInput } from './input'
import { DefaultIssue, defaultIssueSelect } from './output'

export const createIssue = async (
  input: CreateIssueInput,
  accountId: number
): Promise<DefaultIssue> => {
  const issue = await prisma.issue.create({
    data: {
      ...input,
      artists: input.artists
        ? { create: input.artists.map((id, i) => ({ artistId: id, order: i })) }
        : undefined,
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
