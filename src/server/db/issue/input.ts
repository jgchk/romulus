import { z } from 'zod'

import { iso8601 } from '../../../utils/validators'

export const CreateIssueInput = z.object({
  title: z.string().trim().min(1),
  artists: z.number().array(),
  releaseDate: iso8601.optional(),
  spotifyId: z.string().trim().min(1).optional(),
  releaseId: z.number(),
})
export type CreateIssueInput = z.infer<typeof CreateIssueInput>

export const EditIssueInput = z.object({
  id: z.number(),
  data: z.object({
    title: z.string().trim().min(1).optional(),
    artists: z.number().array().optional(),
    releaseDate: iso8601.optional().nullable(),
    spotifyId: z.string().trim().min(1).optional().nullable(),
    releaseId: z.number().optional(),
  }),
})
export type EditIssueInput = z.infer<typeof EditIssueInput>

export const DeleteIssueInput = z.object({ id: z.number() })
export type DeleteIssueInput = z.infer<typeof DeleteIssueInput>
