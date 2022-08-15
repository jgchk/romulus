import { CrudOperation } from '@prisma/client'
import { z } from 'zod'

export const CrudOperationInput = z.union([
  z.literal(CrudOperation.CREATE),
  z.literal(CrudOperation.UPDATE),
  z.literal(CrudOperation.DELETE),
])

export const MIN_GENRE_RELEVANCE = 1
export const MAX_GENRE_RELEVANCE = 7
export const UNSET_GENRE_RELEVANCE = 99

export const GenreRelevanceInput = z
  .number()
  .refine((val) => Number.isInteger(val), { message: 'Must be an integer' })
  .refine(
    (val) =>
      (val >= MIN_GENRE_RELEVANCE && val <= MAX_GENRE_RELEVANCE) ||
      val === UNSET_GENRE_RELEVANCE,
    {
      message: `Must be between ${MIN_GENRE_RELEVANCE} and ${MAX_GENRE_RELEVANCE} (inclusive)`,
    }
  )
