import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

// TODO: need to figure out non-negatives, ranged values

export const InnerSchemaFieldInput = z.object({
  name: nonemptyString(),
  type: z.number(),
  array: z.boolean(),
  nullable: z.boolean(),
})
export type InnerSchemaFieldInput = z.infer<typeof InnerSchemaFieldInput>

export const InnerSchemaObjectInput = z.object({
  name: nonemptyString(),
  fields: z.array(InnerSchemaFieldInput),
})
export type InnerSchemaObjectInput = z.infer<typeof InnerSchemaObjectInput>

export const CreateObjectSchemaInput = z.object({
  objects: z.array(InnerSchemaObjectInput),
})
export type CreateObjectSchemaInput = z.infer<typeof CreateObjectSchemaInput>
