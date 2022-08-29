import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'
import { CreateArtistInput } from '../artist/input'
import { CreateOrConnect } from '../common/inputs'

export const CreateTrackInput = z.object({
  title: nonemptyString(),
  durationMs: z.number(),
  artists: CreateOrConnect(CreateArtistInput).array(),
})
export type CreateTrackInput = z.infer<typeof CreateTrackInput>
