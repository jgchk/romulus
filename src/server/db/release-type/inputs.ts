import { z } from 'zod'

import { InnerSchemaObjectInput } from '../schema/inputs'

export const CreateReleaseTypeInput = z.object({
  schema: InnerSchemaObjectInput,
})
export type CreateReleaseTypeInput = z.infer<typeof CreateReleaseTypeInput>
