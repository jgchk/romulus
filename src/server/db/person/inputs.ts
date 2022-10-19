import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreatePersonInput = z.object({
  firstName: nonemptyString().optional(),
  middleName: nonemptyString().optional(),
  lastName: nonemptyString().optional(),
})
export type CreatePersonInput = z.infer<typeof CreatePersonInput>

export const EditPersonInput = z.object({
  id: z.number(),
  data: z.object({
    firstName: nonemptyString().optional().nullable(),
    middleName: nonemptyString().optional().nullable(),
    lastName: nonemptyString().optional().nullable(),
  }),
})
export type EditPersonInput = z.infer<typeof EditPersonInput>
