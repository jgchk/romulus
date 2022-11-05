import { Prisma } from '@prisma/client'

export const defaultObjectSchemaSelect =
  Prisma.validator<Prisma.SchemaObjectSelect>()({
    id: true,
  })
export type DefaultObjectSchema = Prisma.SchemaObjectGetPayload<{
  select: typeof defaultObjectSchemaSelect
}>
