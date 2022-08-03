import { z } from 'zod'
import isISO8601 from 'validator/lib/isISO8601'

export const iso8601 = z.string().refine((val) => isISO8601(val), {
  message: 'Must be a valid ISO 8601 string',
})
