import { Prisma } from '@prisma/client'

export const defaultTrackSelect = Prisma.validator<Prisma.TrackSelect>()({
  id: true,
  title: true,
  durationMs: true,
  artists: { select: { artistId: true, order: true } },
})
export type DefaultTrack = Prisma.TrackGetPayload<{
  select: typeof defaultTrackSelect
}>
