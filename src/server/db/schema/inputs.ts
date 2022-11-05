import { z } from 'zod'

// TODO: need to figure out non-negatives, ranged values

export const InnerSchemaFieldInput = z.object({
  id: z.number(),
  name: z.string(),
  type: z.number(),
  array: z.boolean(),
  nullable: z.boolean(),
})
export type InnerSchemaFieldInput = z.infer<typeof InnerSchemaFieldInput>

export const InnerSchemaObjectInput = z.object({
  id: z.number(),
  name: z.string(),
  fields: z.array(InnerSchemaFieldInput),
})
export type InnerSchemaObjectInput = z.infer<typeof InnerSchemaObjectInput>

export const CreateObjectSchemaInput = z.object({
  objects: z.array(InnerSchemaObjectInput),
})
export type CreateObjectSchemaInput = z.infer<typeof CreateObjectSchemaInput>
