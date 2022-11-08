import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateSenseInput } from './inputs'
import { defaultSenseSelect } from './outputs'

export const getSenses = () =>
  prisma.sense.findMany({ select: defaultSenseSelect })

export const getSense = async (id: number) => {
  const sense = await prisma.sense.findUnique({
    where: { id },
    select: defaultSenseSelect,
  })

  if (!sense) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No sense with id '${id}'`,
    })
  }

  return sense
}

export const createSense = async (input: CreateSenseInput) => {
  const sense = await prisma.sense.create({
    data: input,
    select: defaultSenseSelect,
  })

  // TODO: sense history

  return sense
}
