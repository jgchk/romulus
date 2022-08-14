import { Prisma } from '@prisma/client'

export const defaultIssueHistorySelect =
  Prisma.validator<Prisma.IssueHistorySelect>()({
    id: true,
    operation: true,
    account: { select: { id: true, username: true } },
    createdAt: true,
  })

export type DefaultIssueHistory = Prisma.IssueHistoryGetPayload<{
  select: typeof defaultIssueHistorySelect
}>
