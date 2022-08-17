import { z } from 'zod'

import { GenreRelevanceInput } from '../common/inputs'

export const CreateAccountInput = z.object({
  username: z.string().trim().min(1, 'Username cannot be empty'),
  password: z.string().trim().min(1, 'Password cannot be empty'),
})
export type CreateAccountInput = z.infer<typeof CreateAccountInput>

export const EditAccountInput = z.object({
  id: z.number(),
  data: z.object({
    genreRelevanceFilter: GenreRelevanceInput.optional(),
  }),
})
export type EditAccountInput = z.infer<typeof EditAccountInput>
