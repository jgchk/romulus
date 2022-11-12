import { z } from 'zod'

import { InnerSchemaObjectInput } from '../schema/inputs'

export const CreateReleaseTypeInput = z.object({
  schema: InnerSchemaObjectInput,
  mediaTypes: z.number().array().nonempty(),
})
export type CreateReleaseTypeInput = z.infer<typeof CreateReleaseTypeInput>
