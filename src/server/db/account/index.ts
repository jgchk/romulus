import bcrypt from 'bcrypt'

import { prisma } from '../../prisma'
import { CreateAccountInput, EditAccountInput } from './inputs'
import { defaultAccountSelect } from './outputs'

export const getAccountById = (id: number) =>
  prisma.account.findUnique({ where: { id }, select: defaultAccountSelect })

export const getAccountByUsername = (username: string) =>
  prisma.account.findUnique({
    where: { username },
    select: defaultAccountSelect,
  })

export const createAccount = async (input: CreateAccountInput) => {
  const hashedPassword = await bcrypt.hash(input.password, 12)

  const account = await prisma.account.create({
    data: {
      username: input.username,
      password: hashedPassword,
    },
    select: defaultAccountSelect,
  })

  return account
}

export const editAccount = (input: EditAccountInput) =>
  prisma.account.update({
    where: { id: input.id },
    data: input.data,
    select: defaultAccountSelect,
  })
