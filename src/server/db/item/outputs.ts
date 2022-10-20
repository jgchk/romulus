import { Prisma } from '@prisma/client'

export const defaultItemSelect = Prisma.validator<Prisma.ItemSelect>()({
  id: true,
})
export type DefaultItem = Prisma.ItemGetPayload<{
  select: typeof defaultItemSelect
}>
