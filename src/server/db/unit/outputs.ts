import { Prisma } from '@prisma/client'

export const defaultUnitSelect = Prisma.validator<Prisma.UnitSelect>()({
  id: true,
})
export type DefaultUnit = Prisma.UnitGetPayload<{
  select: typeof defaultUnitSelect
}>
