import { z } from 'zod'

export const CreateConceptInput = z.object({
  typeId: z.number(),
  unitIds: z.number().array(),
})
export type CreateConceptInput = z.infer<typeof CreateConceptInput>

export const EditConceptInput = z.object({
  id: z.number(),
  data: z.object({
    typeId: z.number().optional(),
    unitIds: z.number().array().optional(),
  }),
})
export type EditConceptInput = z.infer<typeof EditConceptInput>
