import { Prisma } from '@prisma/client'

export const defaultConceptSelect = Prisma.validator<Prisma.ConceptSelect>()({
  id: true,
})
export type DefaultConcept = Prisma.ConceptGetPayload<{
  select: typeof defaultConceptSelect
}>
