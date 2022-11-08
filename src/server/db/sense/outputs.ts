import { Prisma } from '@prisma/client'

export const defaultSenseSelect = Prisma.validator<Prisma.SenseSelect>()({
  id: true,
  name: true,
})
export type DefaultSense = Prisma.SenseGetPayload<{
  select: typeof defaultSenseSelect
}>
