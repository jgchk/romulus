import { z } from 'zod'

import { CreateOrConnect } from '../common/inputs'
import { CreateIssueBaseInput } from '../issue/input'

export const CreateReleaseInput = z.object({
  issue: CreateOrConnect(CreateIssueBaseInput),
})
export type CreateReleaseInput = z.infer<typeof CreateReleaseInput>

export const EditReleaseInput = z.object({
  id: z.number(),
  data: z.object({}),
})
export type EditReleaseInput = z.infer<typeof EditReleaseInput>

export const DeleteReleaseInput = z.object({ id: z.number() })
export type DeleteReleaseInput = z.infer<typeof DeleteReleaseInput>
