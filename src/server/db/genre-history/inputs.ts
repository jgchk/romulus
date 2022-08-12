import { GenreOperation } from '@prisma/client'
import { z } from 'zod'

export const GenreOperationInput = z.union([
  z.literal(GenreOperation.CREATE),
  z.literal(GenreOperation.UPDATE),
  z.literal(GenreOperation.DELETE),
])
