import { z } from 'zod'

export const CreateItemInput = z.object({
  typeId: z.number(),
})
export type CreateItemInput = z.infer<typeof CreateItemInput>

export const EditItemInput = z.object({
  id: z.number(),
  data: z.object({
    typeId: z.number().optional(),
  }),
})
export type EditItemInput = z.infer<typeof EditItemInput>
