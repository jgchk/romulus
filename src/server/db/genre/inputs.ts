import { GenreType } from '@prisma/client'
import { z } from 'zod'

import { nonemptyString } from '../../../utils/validators'
import { GenreRelevanceInput } from '../common/inputs'

export const LocationIdInput = z.object({ id: z.number() })
export const LocationInput = z.object({
  city: nonemptyString().optional(),
  region: nonemptyString().optional(),
  country: nonemptyString(),
})

export const GenreTypeInput = z.union([
  z.literal(GenreType.MOVEMENT),
  z.literal(GenreType.META),
  z.literal(GenreType.STYLE),
  z.literal(GenreType.SCENE),
  z.literal(GenreType.TREND),
])

export const MIN_GENRE_AKA_RELEVANCE = 1
export const MAX_GENRE_AKA_RELEVANCE = 3

export const GenreAkaRelevanceInput = z
  .number()
  .refine((val) => Number.isInteger(val), { message: 'Must be an integer' })
  .refine(
    (val) => val >= MIN_GENRE_AKA_RELEVANCE && val <= MAX_GENRE_AKA_RELEVANCE,
    {
      message: `Must be between ${MIN_GENRE_AKA_RELEVANCE} and ${MAX_GENRE_AKA_RELEVANCE} (inclusive)`,
    }
  )

export const GenreAkaInput = z.object({
  name: nonemptyString(),
  relevance: GenreAkaRelevanceInput,
  order: z.number(),
})
export type GenreAkaInput = z.infer<typeof GenreAkaInput>

export const CreateGenreInput = z.object({
  name: nonemptyString(),
  subtitle: nonemptyString().optional(),
  type: GenreTypeInput,
  shortDescription: nonemptyString().optional(),
  longDescription: nonemptyString().optional(),
  parentGenres: z.number().array().optional(),
  influencedByGenres: z.number().array().optional(),
  notes: nonemptyString().optional(),
  akas: GenreAkaInput.array(),
  relevance: GenreRelevanceInput,
})
export type CreateGenreInput = z.infer<typeof CreateGenreInput>

export const EditGenreInput = z.object({
  id: z.number(),
  data: z.object({
    name: nonemptyString().optional(),
    subtitle: nonemptyString().optional().nullable(),
    type: GenreTypeInput.optional(),
    shortDescription: nonemptyString().optional().nullable(),
    longDescription: nonemptyString().optional().nullable(),
    parentGenres: z.number().array().optional(),
    influencedByGenres: z.number().array().optional(),
    notes: nonemptyString().optional().nullable(),
    akas: GenreAkaInput.array().optional(),
    relevance: GenreRelevanceInput.optional(),
  }),
})
export type EditGenreInput = z.infer<typeof EditGenreInput>

export const DeleteGenreInput = z.object({ id: z.number() })
export type DeleteGenreInput = z.infer<typeof DeleteGenreInput>
