import { Prisma } from '@prisma/client'

import { prisma } from '../prisma'

export const defaultAccountSelect = Prisma.validator<Prisma.AccountSelect>()({
  id: true,
  username: true,
  darkMode: true,
  genresEdited: true,
  permissions: true,
})

export type DefaultAccount = Prisma.AccountGetPayload<{
  select: typeof defaultAccountSelect
}>

export const getAccountById = (id: number) =>
  prisma.account.findUnique({ where: { id }, select: defaultAccountSelect })
