import { z } from 'zod'

import { iso8601, nonemptyString } from '../../../utils/validators'
import { CreateArtistInput } from '../artist/input'
import { CreateOrConnect } from '../common/inputs'
import { CreateObjectInput } from '../object/input'

export const CreateIssueBaseInput = z.object({
  title: nonemptyString(),
  releaseDate: iso8601().optional(),
  spotifyId: nonemptyString().optional(),
  artists: CreateOrConnect(CreateArtistInput).array(),
  objects: CreateOrConnect(CreateObjectInput).array(),
})
export type CreateIssueBaseInput = z.infer<typeof CreateIssueBaseInput>

export const CreateIssueInput = CreateIssueBaseInput.extend({
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
