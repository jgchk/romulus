import { Prisma } from '@prisma/client'

export const defaultArtistSelect = Prisma.validator<Prisma.ArtistSelect>()({
  id: true,
  name: true,
  akas: true,
  spotifyIds: true,
})
export type DefaultArtist = Prisma.ArtistGetPayload<{
  select: typeof defaultArtistSelect
}>

export const simpleArtistSelect = Prisma.validator<Prisma.ArtistSelect>()({
  id: true,
  name: true,
})
export type SimpleArtist = Prisma.ArtistGetPayload<{
  select: typeof simpleArtistSelect
}>
