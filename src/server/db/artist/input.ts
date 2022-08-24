import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateArtistInput = z.object({
  name: nonemptyString(),
  akas: nonemptyString().array(),
  spotifyId: nonemptyString().optional(),
})
export type CreateArtistInput = z.infer<typeof CreateArtistInput>

export const EditArtistInput = z.object({
  id: z.number(),
  data: z.object({
    name: nonemptyString().optional(),
    akas: nonemptyString().array().optional(),
    spotifyId: nonemptyString().optional().nullable(),
  }),
})
export type EditArtistInput = z.infer<typeof EditArtistInput>

export const DeleteArtistInput = z.object({ id: z.number() })
export type DeleteArtistInput = z.infer<typeof DeleteArtistInput>
