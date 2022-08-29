import { Prisma } from '@prisma/client'

export const defaultReleaseSelect = Prisma.validator<Prisma.ReleaseSelect>()({
  id: true,
  issues: { select: { id: true, title: true } },
})
export type DefaultRelease = Prisma.ReleaseGetPayload<{
  select: typeof defaultReleaseSelect
}>
