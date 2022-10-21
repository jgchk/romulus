import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateSongInput = z.object({
  title: nonemptyString(),
})
export type CreateSongInput = z.infer<typeof CreateSongInput>

export const EditSongInput = z.object({
  id: z.number(),
  data: z.object({
    title: nonemptyString().optional(),
  }),
})
export type EditSongInput = z.infer<typeof EditSongInput>
