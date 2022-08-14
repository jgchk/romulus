import { z } from 'zod'

export const CreateArtistInput = z.object({
  name: z.string().trim().min(1),
  akas: z.string().trim().min(1).array(),
  spotifyId: z.string().trim().min(1).optional(),
})
export type CreateArtistInput = z.infer<typeof CreateArtistInput>

export const EditArtistInput = z.object({
  id: z.number(),
  data: z.object({
    name: z.string().trim().min(1).optional(),
    akas: z.string().trim().min(1).array().optional(),
    spotifyId: z.string().trim().min(1).optional().nullable(),
  }),
})
export type EditArtistInput = z.infer<typeof EditArtistInput>

export const DeleteArtistInput = z.object({ id: z.number() })
export type DeleteArtistInput = z.infer<typeof DeleteArtistInput>
