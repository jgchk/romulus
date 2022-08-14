import { Prisma } from '@prisma/client'

export const defaultArtistHistorySelect =
  Prisma.validator<Prisma.ArtistHistorySelect>()({
    id: true,
    name: true,
    akas: true,
    spotifyIds: true,
    artistId: true,
    operation: true,
    account: { select: { id: true, username: true } },
    createdAt: true,
  })

export type DefaultArtistHistory = Prisma.ArtistHistoryGetPayload<{
  select: typeof defaultArtistHistorySelect
}>
