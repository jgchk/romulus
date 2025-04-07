import { z } from 'zod'

export const mediaTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parents: z.string().array(),
})

export type MediaTypeSchema = typeof mediaTypeSchema
