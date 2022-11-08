import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'

export const CreateMediaTypeInput = z
  .object({
    name: nonemptyString(),
    parents: z.number().array(),
    coreSenses: z.number().array(),
    auxSenses: z.number().array(),
  })
  .refine(
    ({ coreSenses, auxSenses }) =>
      coreSenses.every((cs) => !auxSenses.includes(cs)) &&
      auxSenses.every((as) => !coreSenses.includes(as)),
    {
      path: ['coreSenses'],
      message: 'Senses cannot be both core and auxiliary',
    }
  )
export type CreateMediaTypeInput = z.infer<typeof CreateMediaTypeInput>
