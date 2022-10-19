import { Prisma } from '@prisma/client'

export const defaultPersonSelect = Prisma.validator<Prisma.PersonSelect>()({
  id: true,
  firstName: true,
  middleName: true,
  lastName: true,
  memberOf: true,
})
export type DefaultPerson = Prisma.PersonGetPayload<{
  select: typeof defaultPersonSelect
}>
