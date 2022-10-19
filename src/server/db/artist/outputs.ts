import { Prisma } from '@prisma/client'

export const defaultArtistSelect = Prisma.validator<Prisma.ArtistSelect>()({
  id: true,
  name: true,
  members: { include: { person: true } },
})
export type DefaultArtist = Prisma.ArtistGetPayload<{
  select: typeof defaultArtistSelect
}>
