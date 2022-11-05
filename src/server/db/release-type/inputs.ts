import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateReleaseTypeInput = z.object({
  name: nonemptyString(),
})
export type CreateReleaseTypeInput = z.infer<typeof CreateReleaseTypeInput>

export const EditReleaseTypeInput = z.object({
  id: z.number(),
  data: z.object({
    name: nonemptyString().optional(),
  }),
})
export type EditReleaseTypeInput = z.infer<typeof EditReleaseTypeInput>
