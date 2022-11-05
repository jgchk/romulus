import { prisma } from '../../prisma'
import { CreateObjectSchemaInput } from './inputs'
import { defaultObjectSchemaSelect } from './outputs'

export const createObjectSchema = async (input: CreateObjectSchemaInput) => {
  const objects = await prisma.$transaction(
    input.objects.map((objectInput) =>
      prisma.schemaObject.create({
        data: {
          name: objectInput.name,
          fields: {
            create: objectInput.fields.map((field) => ({
              name: field.name,
              type: field.type,
              array: field.array,
              nullable: field.nullable,
            })),
          },
        },
        select: defaultObjectSchemaSelect,
      })
    )
  )

  // TODO: object history?

  return objects
}
