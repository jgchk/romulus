import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateSenseInput = z.object({
  name: nonemptyString(),
})
export type CreateSenseInput = z.infer<typeof CreateSenseInput>
