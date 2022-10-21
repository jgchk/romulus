import { Prisma } from '@prisma/client'

export const defaultReleaseSelect = Prisma.validator<Prisma.ReleaseSelect>()({
  id: true,
})
export type DefaultRelease = Prisma.ReleaseGetPayload<{
  select: typeof defaultReleaseSelect
}>
