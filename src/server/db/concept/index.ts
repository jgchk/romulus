import { TRPCError } from '@trpc/server'

import { prisma } from '../../prisma'
import { CreateConceptInput, EditConceptInput } from './inputs'
import { defaultConceptSelect } from './outputs'

export const getConcepts = () =>
  prisma.concept.findMany({ select: defaultConceptSelect })

export const getConcept = async (id: number) => {
  const concept = await prisma.concept.findUnique({
    where: { id },
    select: defaultConceptSelect,
  })

  if (!concept) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No concept with id '${id}'`,
    })
  }

  return concept
}

export const createConcept = async (input: CreateConceptInput) => {
  const concept = await prisma.concept.create({
    data: {
      typeId: input.typeId,
      units: { connect: input.unitIds.map((unitId) => ({ id: unitId })) },
    },
    select: defaultConceptSelect,
  })

  // TODO: concept history

  return concept
}

export const editConcept = async ({ id, data }: EditConceptInput) => {
  const concept = await prisma.concept.update({
    where: { id },
    data: {
      typeId: data.typeId,
      units: data.unitIds
        ? { set: data.unitIds.map((unitId) => ({ id: unitId })) }
        : undefined,
    },
    select: defaultConceptSelect,
  })

  // TODO: concept history

  return concept
}

export const deleteConcept = async (id: number) => {
  await prisma.concept.delete({ where: { id } })

  // TODO: concept history

  return { id }
}
