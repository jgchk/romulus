import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'
import { CreateOrConnect } from '../common/inputs'
import { CreateTrackInput } from '../track/input'

export const CreateObjectInput = z.object({
  name: nonemptyString(),
  tracks: CreateOrConnect(CreateTrackInput).array(),
})
export type CreateObjectInput = z.infer<typeof CreateObjectInput>
