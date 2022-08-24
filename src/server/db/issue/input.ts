import { z } from 'zod'

import { iso8601, nonemptyString } from '../../../utils/validators'

export const CreateIssueInput = z.object({
  title: nonemptyString(),
  artists: z.number().array(),
  releaseDate: iso8601().optional(),
  spotifyId: nonemptyString().optional(),
  releaseId: z.number(),
})
export type CreateIssueInput = z.infer<typeof CreateIssueInput>

export const EditIssueInput = z.object({
  id: z.number(),
  data: z.object({
    title: nonemptyString().optional(),
    artists: z.number().array().optional(),
    releaseDate: iso8601().optional().nullable(),
    spotifyId: nonemptyString().optional().nullable(),
    releaseId: z.number().optional(),
  }),
})
export type EditIssueInput = z.infer<typeof EditIssueInput>

export const DeleteIssueInput = z.object({ id: z.number() })
export type DeleteIssueInput = z.infer<typeof DeleteIssueInput>
