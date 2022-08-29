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

export const EditTrackInput = z.object({
  id: z.number(),
  data: z.object({
    title: nonemptyString().optional(),
    durationMs: z.number().optional(),
    artists: CreateOrConnect(CreateArtistInput).array().optional(),
  }),
})
export type EditTrackInput = z.infer<typeof EditTrackInput>

export const DeleteTrackInput = z.object({ id: z.number() })
export type DeleteTrackInput = z.infer<typeof DeleteTrackInput>
