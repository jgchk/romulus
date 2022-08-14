import { Prisma } from '@prisma/client'

export const defaultAccountSelect = Prisma.validator<Prisma.AccountSelect>()({
  id: true,
  username: true,
  darkMode: true,
  permissions: true,
  genreRelevanceFilter: true,
})

export type DefaultAccount = Prisma.AccountGetPayload<{
  select: typeof defaultAccountSelect
}>
