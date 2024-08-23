import { z } from 'zod'

export const optionalString = z
  .string()
  .optional()
  .transform((s) => (s?.length ? s : undefined))

export const nullableString = z
  .string()
  .optional()
  .nullable()
  .transform((s) => (s?.length ? s : null))
