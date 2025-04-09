import { z } from 'zod'

export const mediaArtifactTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mediaTypes: z.string().array(),
})

export type MediaArtifactTypeSchema = typeof mediaArtifactTypeSchema
