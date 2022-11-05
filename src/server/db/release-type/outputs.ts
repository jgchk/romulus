import { Prisma } from '@prisma/client'

export const defaultReleaseTypeSelect =
  Prisma.validator<Prisma.ReleaseTypeSelect>()({
    id: true,
    name: true,
  })
export type DefaultReleaseType = Prisma.ReleaseTypeGetPayload<{
  select: typeof defaultReleaseTypeSelect
}>
