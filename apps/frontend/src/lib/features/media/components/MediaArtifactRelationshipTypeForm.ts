import { z } from 'zod'

export const mediaArtifactRelationshipTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parentMediaArtifactType: z.string().default(undefined as unknown as string),
  childMediaArtifactTypes: z.string().array(),
})

export type MediaArtifactRelationshipTypeSchema = typeof mediaArtifactRelationshipTypeSchema
