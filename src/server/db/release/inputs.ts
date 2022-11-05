import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const TrackInput = z.object({
  title: nonemptyString(),
  displayNum: nonemptyString().optional(),
})
export type TrackInput = z.infer<typeof TrackInput>

export const CreateReleaseInput = z.object({
  title: nonemptyString(),
  typeId: z.number(),
  tracks: TrackInput.array(),
})
export type CreateReleaseInput = z.infer<typeof CreateReleaseInput>

export const EditReleaseInput = z.object({
  id: z.number(),
  data: z.object({
    title: nonemptyString().optional(),
    typeId: z.number().optional(),
    tracks: TrackInput.array().optional(),
  }),
})
export type EditReleaseInput = z.infer<typeof EditReleaseInput>
