import { z } from 'zod'

export const CreateReleaseInput = z.object({
  typeId: z.number(),
  unitIds: z.number().array(),
})
export type CreateReleaseInput = z.infer<typeof CreateReleaseInput>

export const EditReleaseInput = z.object({
  id: z.number(),
  data: z.object({
    typeId: z.number().optional(),
    unitIds: z.number().array().optional(),
  }),
})
export type EditReleaseInput = z.infer<typeof EditReleaseInput>
