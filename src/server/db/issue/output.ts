import { Prisma } from '@prisma/client'

export const defaultIssueSelect = Prisma.validator<Prisma.IssueSelect>()({
  id: true,
  title: true,
  artists: true,
  releaseDate: true,
  spotifyId: true,
  releaseId: true,
})
export type DefaultIssue = Prisma.IssueGetPayload<{
  select: typeof defaultIssueSelect
}>
