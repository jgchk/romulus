import { z } from 'zod'

export const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((s) => (s?.length ? s : null))
