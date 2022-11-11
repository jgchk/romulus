import { Prisma } from '@prisma/client'

export const defaultReleaseTypeSelect =
  Prisma.validator<Prisma.ReleaseTypeSelect>()({
    id: true,
    schemaObject: true,
  })
export type DefaultReleaseType = Prisma.ReleaseTypeGetPayload<{
  select: typeof defaultReleaseTypeSelect
}>
