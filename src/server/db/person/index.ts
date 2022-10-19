import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreatePersonInput, EditPersonInput } from './inputs'
import { defaultPersonSelect } from './outputs'

export const getPeople = () =>
  prisma.person.findMany({ select: defaultPersonSelect })

export const getPerson = async (id: number) => {
  const person = await prisma.person.findUnique({
    where: { id },
    select: defaultPersonSelect,
  })

  if (!person) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No person with id '${id}'`,
    })
  }

  return person
}

export const createPerson = async (input: CreatePersonInput) => {
  const person = await prisma.person.create({
    data: input,
    select: defaultPersonSelect,
  })

  // TODO: person history

  return person
}

export const editPerson = async ({ id, data }: EditPersonInput) => {
  const person = await prisma.person.update({
    where: { id },
    data,
    select: defaultPersonSelect,
  })

  // TODO: person history

  return person
}

export const deletePerson = async (id: number) => {
  await prisma.person.delete({ where: { id } })

  // TODO: person history

  return { id }
}
