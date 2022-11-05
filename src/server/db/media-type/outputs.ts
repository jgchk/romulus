import { Prisma } from '@prisma/client'

export const defaultMediaTypeSelect =
  Prisma.validator<Prisma.MediaTypeSelect>()({
    id: true,
    name: true,
  })
export type DefaultMediaType = Prisma.MediaTypeGetPayload<{
  select: typeof defaultMediaTypeSelect
}>
