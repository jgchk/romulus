import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const MemberInput = z.object({
  personId: z.number(),
  name: z.string().optional(),
})
export type MemberInput = z.infer<typeof MemberInput>

export const CreateArtistInput = z.object({
  name: nonemptyString().optional(),
  members: MemberInput.array(),
})
export type CreateArtistInput = z.infer<typeof CreateArtistInput>

export const EditArtistInput = z.object({
  id: z.number(),
  data: z.object({
    name: nonemptyString().optional().nullable(),
    members: MemberInput.array().optional(),
  }),
})
export type EditArtistInput = z.infer<typeof EditArtistInput>
