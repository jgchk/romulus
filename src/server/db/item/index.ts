import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateItemInput, EditItemInput } from './inputs'
import { defaultItemSelect } from './outputs'

export const getItems = () =>
  prisma.item.findMany({ select: defaultItemSelect })

export const getItem = async (id: number) => {
  const item = await prisma.item.findUnique({
    where: { id },
    select: defaultItemSelect,
  })

  if (!item) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No item with id '${id}'`,
    })
  }

  return item
}

export const createItem = async (input: CreateItemInput) => {
  const item = await prisma.item.create({
    data: input,
    select: defaultItemSelect,
  })

  // TODO: item history

  return item
}

export const editItem = async ({ id, data }: EditItemInput) => {
  const item = await prisma.item.update({
    where: { id },
    data,
    select: defaultItemSelect,
  })

  // TODO: item history

  return item
}

export const deleteItem = async (id: number) => {
  await prisma.item.delete({ where: { id } })

  // TODO: item history

  return { id }
}
