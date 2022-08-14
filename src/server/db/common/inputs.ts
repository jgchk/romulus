import { CrudOperation } from '@prisma/client'
import { z } from 'zod'

export const CrudOperationInput = z.union([
  z.literal(CrudOperation.CREATE),
  z.literal(CrudOperation.UPDATE),
  z.literal(CrudOperation.DELETE),
])

export const GenreRelevanceInput = z
  .number()
  .refine((val) => Number.isInteger(val), { message: 'Must be an integer' })
  .refine((val) => val >= 1 && val <= 5, {
    message: 'Must be between 1 and 5 (inclusive)',
  })
