import { z } from 'zod'

import { GenreRelevanceInput } from '../common/inputs'

export const EditAccountInput = z.object({
  id: z.number(),
  data: z.object({
    genreRelevanceFilter: GenreRelevanceInput.optional(),
  }),
})
export type EditAccountInput = z.infer<typeof EditAccountInput>
