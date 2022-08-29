import { Prisma } from '@prisma/client'

export const defaultIssueSelect = Prisma.validator<Prisma.IssueSelect>()({
  id: true,
  title: true,
  releaseDate: true,
  artists: { select: { artistId: true, order: true } },
  objects: { select: { objectId: true, order: true } },

  spotifyId: true,

  releaseId: true,
})
export type DefaultIssue = Prisma.IssueGetPayload<{
  select: typeof defaultIssueSelect
}>
