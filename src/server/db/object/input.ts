import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'
import { CreateOrConnect } from '../common/inputs'
import { CreateTrackInput } from '../track/input'

export const CreateObjectInput = z.object({
  name: nonemptyString(),
  tracks: CreateOrConnect(CreateTrackInput).array(),
})
export type CreateObjectInput = z.infer<typeof CreateObjectInput>

export const EditObjectInput = z.object({
  id: z.number(),
  data: z.object({
    name: nonemptyString().optional(),
    tracks: CreateOrConnect(CreateTrackInput).array().optional(),
  }),
})
export type EditObjectInput = z.infer<typeof EditObjectInput>

export const DeleteObjectInput = z.object({ id: z.number() })
export type DeleteObjectInput = z.infer<typeof DeleteObjectInput>
