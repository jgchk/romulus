import { CrudOperation } from '@prisma/client'
import { z } from 'zod'

export const CrudOperationInput = z.union([
  z.literal(CrudOperation.CREATE),
  z.literal(CrudOperation.UPDATE),
  z.literal(CrudOperation.DELETE),
])
