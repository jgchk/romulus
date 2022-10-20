import { z } from 'zod'

export const CreateUnitInput = z.object({})
export type CreateUnitInput = z.infer<typeof CreateUnitInput>

export const EditUnitInput = z.object({
  id: z.number(),
  data: z.object({}),
})
export type EditUnitInput = z.infer<typeof EditUnitInput>
