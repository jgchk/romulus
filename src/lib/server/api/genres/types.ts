import { z } from 'zod'

import { GENRE_TYPES, genreRelevance } from '$lib/types/genres'
import { nullableString } from '$lib/utils/validators'

export const genreSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  shortDescription: nullableString,
  longDescription: nullableString,
  notes: nullableString,
  type: z.enum(GENRE_TYPES),
  subtitle: nullableString,

  primaryAkas: nullableString,
  secondaryAkas: nullableString,
  tertiaryAkas: nullableString,

  parents: z.number().int().array(),
  influencedBy: z.number().int().array(),

  relevance: genreRelevance.optional(),
  nsfw: z.boolean(),
})

export type GenreSchema = typeof genreSchema
export type GenreData = z.infer<typeof genreSchema>
