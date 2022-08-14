import { prisma } from '../../prisma'
import { EditAccountInput } from './inputs'
import { defaultAccountSelect } from './outputs'

export const getAccountById = (id: number) =>
  prisma.account.findUnique({ where: { id }, select: defaultAccountSelect })

export const editAccount = (input: EditAccountInput) =>
  prisma.account.update({
    where: { id: input.id },
    data: input.data,
    select: defaultAccountSelect,
  })
