import { Prisma } from '@prisma/client'

export const defaultObjectSelect = Prisma.validator<Prisma.ObjectSelect>()({
  id: true,
  name: true,
  tracks: { select: { trackId: true, order: true } },
})
export type DefaultObject = Prisma.ObjectGetPayload<{
  select: typeof defaultObjectSelect
}>
