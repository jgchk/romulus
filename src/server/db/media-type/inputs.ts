import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateMediaTypeInput = z.object({
  name: nonemptyString(),
  parents: z.number().array(),
  coreSenses: z.number().array(),
  auxSenses: z.number().array(),
})
export type CreateMediaTypeInput = z.infer<typeof CreateMediaTypeInput>
