import { Prisma } from '@prisma/client'

export const defaultReleaseHistorySelect =
  Prisma.validator<Prisma.ReleaseHistorySelect>()({
    id: true,
    operation: true,
    account: { select: { id: true, username: true } },
    createdAt: true,
  })

export type DefaultReleaseHistory = Prisma.ReleaseHistoryGetPayload<{
  select: typeof defaultReleaseHistorySelect
}>
