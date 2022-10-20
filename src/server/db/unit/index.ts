import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateUnitInput, EditUnitInput } from './inputs'
import { defaultUnitSelect } from './outputs'

export const getUnits = () =>
  prisma.unit.findMany({ select: defaultUnitSelect })

export const getUnit = async (id: number) => {
  const unit = await prisma.unit.findUnique({
    where: { id },
    select: defaultUnitSelect,
  })

  if (!unit) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No unit with id '${id}'`,
    })
  }

  return unit
}

export const createUnit = async (input: CreateUnitInput) => {
  const unit = await prisma.unit.create({
    data: input,
    select: defaultUnitSelect,
  })

  // TODO: unit history

  return unit
}

export const editUnit = async ({ id, data }: EditUnitInput) => {
  const unit = await prisma.unit.update({
    where: { id },
    data,
    select: defaultUnitSelect,
  })

  // TODO: unit history

  return unit
}

export const deleteUnit = async (id: number) => {
  await prisma.unit.delete({ where: { id } })

  // TODO: unit history

  return { id }
}
