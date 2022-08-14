import { z } from 'zod'

export const CreateReleaseInput = z.object({})
export type CreateReleaseInput = z.infer<typeof CreateReleaseInput>

export const EditReleaseInput = z.object({
  id: z.number(),
  data: z.object({}),
})
export type EditReleaseInput = z.infer<typeof EditReleaseInput>

export const DeleteReleaseInput = z.object({ id: z.number() })
export type DeleteReleaseInput = z.infer<typeof DeleteReleaseInput>
